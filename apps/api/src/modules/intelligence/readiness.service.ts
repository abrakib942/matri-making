import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';

interface ReadinessItem {
  key: string;
  weight: number;
  achieved: boolean;
  progress?: number; // 0..1 for partial items
}

/**
 * Marriage Readiness Meter: a weighted checklist across profile completion,
 * identity verification, income, education, family, guardian, and health.
 */
@Injectable()
export class ReadinessService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  async computeForProfile(profileId: number): Promise<{
    percent: number;
    items: ReadinessItem[];
  } | null> {
    const profile = await this.db.profile.findUnique({
      where: { id: profileId },
      include: {
        islamicDetails: true,
        members: { where: { inviteStatus: 'ACCEPTED' }, select: { userId: true, role: true } },
      },
    });

    if (!profile) return null;

    const ownerUserIds = profile.members.map(m => m.userId);

    const [users, verifications] = await Promise.all([
      this.db.user.findMany({
        where: { id: { in: ownerUserIds } },
        select: { emailVerifiedAt: true, phoneVerifiedAt: true },
      }),
      this.db.verificationRequest.findMany({
        where: { userId: { in: ownerUserIds }, status: 'APPROVED' },
        select: { type: true },
      }),
    ]);

    const emailVerified = users.some(u => !!u.emailVerifiedAt);
    const phoneVerified = users.some(u => !!u.phoneVerifiedAt);
    const approvedTypes = new Set(verifications.map(v => v.type));

    const items: ReadinessItem[] = [
      {
        key: 'PROFILE_COMPLETION',
        weight: 30,
        achieved: profile.completionPercent >= 90,
        progress: profile.completionPercent / 100,
      },
      { key: 'EMAIL_VERIFIED', weight: 5, achieved: emailVerified },
      { key: 'PHONE_VERIFIED', weight: 5, achieved: phoneVerified },
      {
        key: 'IDENTITY_VERIFIED',
        weight: 15,
        achieved: approvedTypes.has('NID') || approvedTypes.has('FACE'),
      },
      {
        key: 'INCOME_STATED',
        weight: 10,
        achieved: profile.monthlyIncomeBdt !== null && profile.monthlyIncomeBdt > 0,
      },
      { key: 'EDUCATION_STATED', weight: 10, achieved: !!profile.educationLevel },
      {
        key: 'FAMILY_INFO',
        weight: 10,
        achieved:
          profile.fatherAlive !== null &&
          profile.motherAlive !== null &&
          (!!profile.familyDetails || profile.familyStatus !== null),
      },
      {
        key: 'GUARDIAN_VERIFIED',
        weight: 10,
        achieved:
          approvedTypes.has('GUARDIAN') ||
          (!!profile.islamicDetails?.waliName && profile.islamicDetails?.waliApproves === true),
      },
      {
        key: 'HEALTH_INFO',
        weight: 5,
        achieved: profile.hasHealthIssues !== null,
      },
    ];

    const percent = Math.round(
      items.reduce(
        (sum, item) => sum + item.weight * (item.achieved ? 1 : (item.progress ?? 0)),
        0,
      ),
    );

    await this.db.profile.update({
      where: { id: profileId },
      data: { readinessPercent: percent },
    });

    return { percent, items };
  }

  async getReadiness(userId: number, profileId: number): Promise<ServiceResult> {
    const isManager = await this.access.isManager(userId, profileId);

    if (!isManager) {
      return createErrorResult(
        { name: 'forbidden', message: 'You do not manage this profile' },
        'You do not manage this profile',
      );
    }

    const result = await this.computeForProfile(profileId);

    if (!result) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    return createSuccessResult(result, 'Marriage readiness computed successfully');
  }
}
