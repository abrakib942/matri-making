import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { FeatureGateService } from '@/modules/payment/feature-gate.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';
import {
  BlockProfileDto,
  ListInterestsDto,
  NoteDto,
  RespondInterestDto,
  SendInterestDto,
} from './dto/index';
import { MutualMatchService } from './mutual-match.service';

const PROFILE_CARD_SELECT = {
  id: true,
  biodataNo: true,
  fullName: true,
  mode: true,
  gender: true,
  maritalStatus: true,
  educationLevel: true,
  professionKey: true,
  districtId: true,
  greenFlags: true,
  verificationBadges: true,
  isPremium: true,
} as const;

@Injectable()
export class InterestService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  @Inject()
  private readonly featureGate: FeatureGateService;

  @Inject()
  private readonly mutualMatch: MutualMatchService;

  // ---------- helpers ----------

  private async resolveActingProfile(
    userId: number,
    explicitProfileId?: number,
  ): Promise<{ profileId?: number; error?: ServiceResult }> {
    if (explicitProfileId) {
      const isManager = await this.access.isManager(userId, explicitProfileId);

      if (!isManager) {
        return {
          error: createErrorResult(
            { name: 'forbidden', message: 'You do not manage this profile' },
            'You do not manage this profile',
          ),
        };
      }

      return { profileId: explicitProfileId };
    }

    const profileId = await this.access.getPrimaryProfileId(userId);

    if (!profileId) {
      return {
        error: createErrorResult(
          { name: 'badRequest', message: 'Create a biodata before performing this action' },
          'Create a biodata before performing this action',
        ),
      };
    }

    return { profileId };
  }

  private async assertNotBlocked(profileAId: number, profileBId: number): Promise<boolean> {
    const block = await this.db.block.findFirst({
      where: {
        OR: [
          { ownerProfileId: profileAId, targetProfileId: profileBId },
          { ownerProfileId: profileBId, targetProfileId: profileAId },
        ],
      },
    });

    return !block;
  }

  private async notifyProfileManagers(
    profileId: number,
    payload: Parameters<InAppNotificationService['notify']>[1],
  ): Promise<void> {
    const members = await this.db.profileMember.findMany({
      where: { profileId, inviteStatus: 'ACCEPTED' },
      select: { userId: true },
    });

    await Promise.all(members.map(m => this.notifications.notify(m.userId, payload)));
  }

  // ---------- interests ----------

  async sendInterest(userId: number, dto: SendInterestDto): Promise<ServiceResult> {
    const { profileId: fromProfileId, error } = await this.resolveActingProfile(
      userId,
      dto.fromProfileId,
    );
    if (error || !fromProfileId) return error!;

    if (fromProfileId === dto.toProfileId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Cannot send interest to your own profile' },
        'Cannot send interest to your own profile',
      );
    }

    const target = await this.db.profile.findUnique({
      where: { id: dto.toProfileId },
      include: { privacySettings: true },
    });

    if (!target || target.status !== 'ACTIVE') {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    const fromProfile = await this.db.profile.findUnique({ where: { id: fromProfileId } });

    if (fromProfile!.gender === target.gender) {
      return createErrorResult(
        { name: 'badRequest', message: 'Interests can only be sent to opposite-gender profiles' },
        'Interests can only be sent to opposite-gender profiles',
      );
    }

    if (!(await this.assertNotBlocked(fromProfileId, dto.toProfileId))) {
      return createErrorResult(
        { name: 'forbidden', message: 'This action is not available' },
        'This action is not available',
      );
    }

    const existing = await this.db.interest.findUnique({
      where: {
        fromProfileId_toProfileId: { fromProfileId, toProfileId: dto.toProfileId },
      },
    });

    if (existing && existing.status !== 'WITHDRAWN') {
      return createErrorResult(
        { name: 'badRequest', message: 'Interest already sent to this profile' },
        'Interest already sent to this profile',
      );
    }

    // Quota enforcement via plan entitlements (-1 = unlimited).
    const features = await this.featureGate.getFeatures(userId);

    if (!features.unlimitedInterests && features.monthlyInterestQuota >= 0) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const sentThisMonth = await this.db.interest.count({
        where: { fromProfileId, createdAt: { gte: monthStart } },
      });

      if (sentThisMonth >= features.monthlyInterestQuota) {
        return createErrorResult(
          {
            name: 'forbidden',
            message: `You can send ${features.monthlyInterestQuota} interests per month on your current plan. Upgrade to premium for unlimited interests.`,
          },
          'Monthly interest quota reached',
        );
      }
    }

    const interest = existing
      ? await this.db.interest.update({
          where: { id: existing.id },
          data: { status: 'PENDING', message: dto.message, respondedAt: null },
        })
      : await this.db.interest.create({
          data: { fromProfileId, toProfileId: dto.toProfileId, message: dto.message },
        });

    await this.notifyProfileManagers(dto.toProfileId, {
      type: 'INTEREST_RECEIVED',
      titleEn: 'New interest received',
      titleBn: 'নতুন আগ্রহ এসেছে',
      bodyEn: `Biodata ${fromProfile!.biodataNo} has expressed interest.`,
      bodyBn: `বায়োডাটা ${fromProfile!.biodataNo} আগ্রহ প্রকাশ করেছে।`,
      data: { interestId: interest.id, fromProfileId },
    });

    return createSuccessResult(interest, 'Interest sent successfully');
  }

  async respondInterest(
    userId: number,
    interestId: number,
    dto: RespondInterestDto,
  ): Promise<ServiceResult> {
    const interest = await this.db.interest.findUnique({
      where: { id: interestId },
      include: { fromProfile: true, toProfile: true },
    });

    if (!interest) {
      return createErrorResult(
        { name: 'badRequest', message: 'Interest not found' },
        'Interest not found',
      );
    }

    const isManager = await this.access.isManager(userId, interest.toProfileId);

    if (!isManager) {
      return createErrorResult(
        { name: 'forbidden', message: 'You cannot respond to this interest' },
        'You cannot respond to this interest',
      );
    }

    if (interest.status !== 'PENDING') {
      return createErrorResult(
        { name: 'badRequest', message: 'This interest has already been responded to' },
        'This interest has already been responded to',
      );
    }

    const updated = await this.db.interest.update({
      where: { id: interestId },
      data: { status: dto.response, respondedAt: new Date() },
    });

    if (dto.response === 'ACCEPTED') {
      // Start the marriage journey and record the acceptance event.
      await this.db.matchJourney.create({
        data: {
          interestId,
          stage: 'ACCEPTED',
          events: { create: { stage: 'ACCEPTED', byProfileId: interest.toProfileId } },
        },
      });
    }

    await this.notifyProfileManagers(interest.fromProfileId, {
      type: dto.response === 'ACCEPTED' ? 'INTEREST_ACCEPTED' : 'INTEREST_REJECTED',
      titleEn:
        dto.response === 'ACCEPTED' ? 'Your interest was accepted' : 'Your interest was declined',
      titleBn:
        dto.response === 'ACCEPTED'
          ? 'আপনার আগ্রহ গৃহীত হয়েছে'
          : 'আপনার আগ্রহ প্রত্যাখ্যাত হয়েছে',
      bodyEn: `Biodata ${interest.toProfile.biodataNo} has responded to your interest.`,
      bodyBn: `বায়োডাটা ${interest.toProfile.biodataNo} আপনার আগ্রহের জবাব দিয়েছে।`,
      data: { interestId },
    });

    return createSuccessResult(updated, `Interest ${dto.response.toLowerCase()} successfully`);
  }

  async withdrawInterest(userId: number, interestId: number): Promise<ServiceResult> {
    const interest = await this.db.interest.findUnique({ where: { id: interestId } });

    if (!interest) {
      return createErrorResult(
        { name: 'badRequest', message: 'Interest not found' },
        'Interest not found',
      );
    }

    const isManager = await this.access.isManager(userId, interest.fromProfileId);

    if (!isManager) {
      return createErrorResult(
        { name: 'forbidden', message: 'You cannot withdraw this interest' },
        'You cannot withdraw this interest',
      );
    }

    if (interest.status !== 'PENDING') {
      return createErrorResult(
        { name: 'badRequest', message: 'Only pending interests can be withdrawn' },
        'Only pending interests can be withdrawn',
      );
    }

    const updated = await this.db.interest.update({
      where: { id: interestId },
      data: { status: 'WITHDRAWN' },
    });

    return createSuccessResult(updated, 'Interest withdrawn successfully');
  }

  async listInterests(userId: number, dto: ListInterestsDto): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const limit = dto.limit ?? 20;

    const interests = await this.db.interest.findMany({
      where: {
        ...(dto.direction === 'sent' ? { fromProfileId: profileId } : { toProfileId: profileId }),
        ...(dto.status ? { status: dto.status } : {}),
      },
      include: {
        fromProfile: { select: PROFILE_CARD_SELECT },
        toProfile: { select: PROFILE_CARD_SELECT },
        journey: true,
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
    });

    const hasMore = interests.length > limit;
    const items = hasMore ? interests.slice(0, limit) : interests;

    return createSuccessResult(
      { items, nextCursor: hasMore ? items[items.length - 1].id : null },
      'Interests retrieved successfully',
    );
  }

  // ---------- shortlist / favourite ----------

  async addShortlist(userId: number, targetProfileId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const data = await this.db.shortlist.upsert({
      where: {
        ownerProfileId_targetProfileId: { ownerProfileId: profileId, targetProfileId },
      },
      update: {},
      create: { ownerProfileId: profileId, targetProfileId },
    });

    await this.mutualMatch.detectAfterShortlist(profileId, targetProfileId);

    return createSuccessResult(data, 'Profile shortlisted');
  }

  async removeShortlist(userId: number, targetProfileId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    await this.db.shortlist.deleteMany({
      where: { ownerProfileId: profileId, targetProfileId },
    });

    return createSuccessResult({ removed: true }, 'Removed from shortlist');
  }

  async listShortlist(userId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const items = await this.db.shortlist.findMany({
      where: { ownerProfileId: profileId },
      include: { targetProfile: { select: PROFILE_CARD_SELECT } },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(items, 'Shortlist retrieved successfully');
  }

  async listMutualMatches(userId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const items = await this.mutualMatch.listForProfile(profileId);
    return createSuccessResult({ count: items.length, items }, 'Mutual matches retrieved');
  }

  async addFavourite(userId: number, targetProfileId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const data = await this.db.favourite.upsert({
      where: {
        ownerProfileId_targetProfileId: { ownerProfileId: profileId, targetProfileId },
      },
      update: {},
      create: { ownerProfileId: profileId, targetProfileId },
    });

    return createSuccessResult(data, 'Profile added to favourites');
  }

  async removeFavourite(userId: number, targetProfileId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    await this.db.favourite.deleteMany({
      where: { ownerProfileId: profileId, targetProfileId },
    });

    return createSuccessResult({ removed: true }, 'Removed from favourites');
  }

  async listFavourites(userId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const items = await this.db.favourite.findMany({
      where: { ownerProfileId: profileId },
      include: { targetProfile: { select: PROFILE_CARD_SELECT } },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(items, 'Favourites retrieved successfully');
  }

  // ---------- block ----------

  async blockProfile(
    userId: number,
    targetProfileId: number,
    dto: BlockProfileDto,
  ): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    if (profileId === targetProfileId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Cannot block your own profile' },
        'Cannot block your own profile',
      );
    }

    const data = await this.db.block.upsert({
      where: {
        ownerProfileId_targetProfileId: { ownerProfileId: profileId, targetProfileId },
      },
      update: { reason: dto.reason },
      create: { ownerProfileId: profileId, targetProfileId, reason: dto.reason },
    });

    // Withdraw pending interests in both directions.
    await this.db.interest.updateMany({
      where: {
        status: 'PENDING',
        OR: [
          { fromProfileId: profileId, toProfileId: targetProfileId },
          { fromProfileId: targetProfileId, toProfileId: profileId },
        ],
      },
      data: { status: 'WITHDRAWN' },
    });

    return createSuccessResult(data, 'Profile blocked');
  }

  async unblockProfile(userId: number, targetProfileId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    await this.db.block.deleteMany({
      where: { ownerProfileId: profileId, targetProfileId },
    });

    return createSuccessResult({ removed: true }, 'Profile unblocked');
  }

  async listBlocks(userId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const items = await this.db.block.findMany({
      where: { ownerProfileId: profileId },
      include: { targetProfile: { select: PROFILE_CARD_SELECT } },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(items, 'Blocked profiles retrieved successfully');
  }

  // ---------- notes ----------

  async upsertNote(userId: number, targetProfileId: number, dto: NoteDto): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const data = await this.db.profileNote.upsert({
      where: {
        ownerProfileId_targetProfileId: { ownerProfileId: profileId, targetProfileId },
      },
      update: { note: dto.note },
      create: { ownerProfileId: profileId, targetProfileId, note: dto.note },
    });

    return createSuccessResult(data, 'Note saved');
  }

  async removeNote(userId: number, targetProfileId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    await this.db.profileNote.deleteMany({
      where: { ownerProfileId: profileId, targetProfileId },
    });

    return createSuccessResult({ removed: true }, 'Note removed');
  }

  async listNotes(userId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const items = await this.db.profileNote.findMany({
      where: { ownerProfileId: profileId },
      include: { targetProfile: { select: PROFILE_CARD_SELECT } },
      orderBy: { updatedAt: 'desc' },
    });

    return createSuccessResult(items, 'Notes retrieved successfully');
  }

  // ---------- visitors ----------

  async listVisitors(userId: number): Promise<ServiceResult> {
    const { profileId, error } = await this.resolveActingProfile(userId);
    if (error || !profileId) return error!;

    const features = await this.featureGate.getFeatures(userId);

    if (!features.visitorInsights) {
      return createErrorResult(
        { name: 'forbidden', message: 'Visitor insights require a premium subscription' },
        'Visitor insights require a premium subscription',
      );
    }

    const items = await this.db.profileVisit.findMany({
      where: { targetProfileId: profileId },
      include: { visitorProfile: { select: PROFILE_CARD_SELECT } },
      orderBy: { visitedAt: 'desc' },
      take: 50,
    });

    return createSuccessResult(items, 'Visitors retrieved successfully');
  }
}
