import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';
import { JourneyStage } from '@prisma/client';
import { UpdateJourneyStageDto } from './dto/index';

const STAGE_ORDER: JourneyStage[] = [
  'ACCEPTED',
  'FAMILY_DISCUSSION',
  'MEETING',
  'ENGAGEMENT',
  'MARRIED',
];

const CARD_SELECT = {
  id: true,
  biodataNo: true,
  fullName: true,
  mode: true,
  gender: true,
} as const;

/**
 * Marriage timeline: Accepted -> Family Discussion -> Meeting -> Engagement
 * -> Married, with an event log. "Married" requires confirmation from both
 * sides before the stage flips.
 */
@Injectable()
export class JourneyService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  private async resolveSide(
    userId: number,
    journeyId: number,
  ): Promise<{
    journey?: NonNullable<Awaited<ReturnType<JourneyService['loadJourney']>>>;
    side?: 'from' | 'to';
    error?: ServiceResult;
  }> {
    const journey = await this.loadJourney(journeyId);

    if (!journey) {
      return {
        error: createErrorResult(
          { name: 'badRequest', message: 'Journey not found' },
          'Journey not found',
        ),
      };
    }

    const [managesFrom, managesTo] = await Promise.all([
      this.access.isManager(userId, journey.interest.fromProfileId),
      this.access.isManager(userId, journey.interest.toProfileId),
    ]);

    if (!managesFrom && !managesTo) {
      return {
        error: createErrorResult(
          { name: 'forbidden', message: 'You are not part of this journey' },
          'You are not part of this journey',
        ),
      };
    }

    return { journey, side: managesFrom ? 'from' : 'to' };
  }

  private loadJourney(id: number) {
    return this.db.matchJourney.findUnique({
      where: { id },
      include: {
        interest: {
          include: {
            fromProfile: { select: CARD_SELECT },
            toProfile: { select: CARD_SELECT },
          },
        },
        events: { orderBy: { id: 'asc' } },
      },
    });
  }

  async listMine(userId: number): Promise<ServiceResult> {
    const profileId = await this.access.getPrimaryProfileId(userId);

    if (!profileId) {
      return createSuccessResult([], 'Journeys retrieved successfully');
    }

    const journeys = await this.db.matchJourney.findMany({
      where: {
        interest: {
          OR: [{ fromProfileId: profileId }, { toProfileId: profileId }],
        },
      },
      include: {
        interest: {
          include: {
            fromProfile: { select: CARD_SELECT },
            toProfile: { select: CARD_SELECT },
          },
        },
        events: { orderBy: { id: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return createSuccessResult(journeys, 'Journeys retrieved successfully');
  }

  async getById(userId: number, id: number): Promise<ServiceResult> {
    const { journey, error } = await this.resolveSide(userId, id);
    if (error || !journey) return error!;

    return createSuccessResult(journey, 'Journey retrieved successfully');
  }

  async updateStage(
    userId: number,
    id: number,
    dto: UpdateJourneyStageDto,
  ): Promise<ServiceResult> {
    const { journey, side, error } = await this.resolveSide(userId, id);
    if (error || !journey || !side) return error!;

    if (journey.stage === 'MARRIED' || journey.stage === 'DISCONTINUED') {
      return createErrorResult(
        { name: 'badRequest', message: 'This journey has already concluded' },
        'This journey has already concluded',
      );
    }

    const actorProfileId =
      side === 'from' ? journey.interest.fromProfileId : journey.interest.toProfileId;
    const otherProfileId =
      side === 'from' ? journey.interest.toProfileId : journey.interest.fromProfileId;

    let newStage: JourneyStage = journey.stage;
    let marriedConfirmedByFrom = journey.marriedConfirmedByFrom;
    let marriedConfirmedByTo = journey.marriedConfirmedByTo;
    let message = '';

    if (dto.stage === 'MARRIED') {
      if (side === 'from') marriedConfirmedByFrom = true;
      else marriedConfirmedByTo = true;

      if (marriedConfirmedByFrom && marriedConfirmedByTo) {
        newStage = 'MARRIED';
        message = 'Marriage confirmed by both families. Congratulations!';
      } else {
        message = 'Marriage confirmation recorded; waiting for the other family to confirm.';
      }
    } else if (dto.stage === 'DISCONTINUED') {
      newStage = 'DISCONTINUED';
      message = 'Journey discontinued';
    } else {
      // Forward-only progression through the pipeline.
      const currentIndex = STAGE_ORDER.indexOf(journey.stage);
      const nextIndex = STAGE_ORDER.indexOf(dto.stage);

      if (nextIndex <= currentIndex) {
        return createErrorResult(
          { name: 'badRequest', message: 'The journey can only move forward' },
          'The journey can only move forward',
        );
      }

      newStage = dto.stage;
      message = 'Journey stage updated';
    }

    const updated = await this.db.matchJourney.update({
      where: { id },
      data: {
        stage: newStage,
        marriedConfirmedByFrom,
        marriedConfirmedByTo,
        events: {
          create: {
            stage: dto.stage,
            note: dto.note,
            byProfileId: actorProfileId,
          },
        },
      },
      include: { events: { orderBy: { id: 'asc' } } },
    });

    // Notify the other family.
    const otherMembers = await this.db.profileMember.findMany({
      where: { profileId: otherProfileId, inviteStatus: 'ACCEPTED' },
      select: { userId: true },
    });

    await Promise.all(
      otherMembers.map(m =>
        this.notifications.notify(m.userId, {
          type: 'JOURNEY_UPDATED',
          titleEn: 'Marriage timeline updated',
          titleBn: 'বিবাহের অগ্রগতি আপডেট হয়েছে',
          bodyEn: `The journey has moved to: ${dto.stage.replace(/_/g, ' ').toLowerCase()}`,
          data: { journeyId: id, stage: dto.stage },
        }),
      ),
    );

    return createSuccessResult(updated, message);
  }
}
