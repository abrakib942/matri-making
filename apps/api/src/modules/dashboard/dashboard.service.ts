import { createSuccessResult, ServiceResult } from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { RecommendationService } from '@/modules/intelligence/recommendation.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';

const CARD_SELECT = {
  id: true,
  biodataNo: true,
  mode: true,
  gender: true,
  maritalStatus: true,
  educationLevel: true,
  professionKey: true,
  districtId: true,
  greenFlags: true,
  isPremium: true,
} as const;

@Injectable()
export class DashboardService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  @Inject()
  private readonly recommendations: RecommendationService;

  async getDashboard(userId: number): Promise<ServiceResult> {
    const profileId = await this.access.getPrimaryProfileId(userId);

    if (!profileId) {
      // User has no biodata yet: onboarding-focused dashboard.
      const unreadNotifications = await this.db.notification.count({
        where: { userId, readAt: null },
      });

      return createSuccessResult(
        { hasProfile: false, unreadNotifications },
        'Dashboard retrieved successfully',
      );
    }

    const [
      profile,
      visitorCount,
      recentVisitors,
      interestsReceivedPending,
      interestsSentPending,
      interestsAccepted,
      unlocksPurchased,
      unreadNotifications,
      recentNotifications,
      shortlistCount,
      recommendationResult,
    ] = await Promise.all([
      this.db.profile.findUnique({
        where: { id: profileId },
        select: {
          id: true,
          biodataNo: true,
          fullName: true,
          mode: true,
          status: true,
          completionPercent: true,
          readinessPercent: true,
          greenFlags: true,
          verificationBadges: true,
          isPremium: true,
          viewCount: true,
        },
      }),
      this.db.profileVisit.count({ where: { targetProfileId: profileId } }),
      this.db.profileVisit.findMany({
        where: { targetProfileId: profileId },
        orderBy: { visitedAt: 'desc' },
        take: 5,
        include: { visitorProfile: { select: CARD_SELECT } },
      }),
      this.db.interest.count({ where: { toProfileId: profileId, status: 'PENDING' } }),
      this.db.interest.count({ where: { fromProfileId: profileId, status: 'PENDING' } }),
      this.db.interest.count({
        where: {
          status: 'ACCEPTED',
          OR: [{ fromProfileId: profileId }, { toProfileId: profileId }],
        },
      }),
      this.db.biodataUnlock.count({ where: { viewerUserId: userId } }),
      this.db.notification.count({ where: { userId, readAt: null } }),
      this.db.notification.findMany({
        where: { userId },
        orderBy: { id: 'desc' },
        take: 10,
      }),
      this.db.shortlist.count({ where: { ownerProfileId: profileId } }),
      this.recommendations.getRecommendations(userId),
    ]);

    const recommendedMatches = recommendationResult.success
      ? (recommendationResult.data as unknown[]).slice(0, 6)
      : [];

    return createSuccessResult(
      {
        hasProfile: true,
        profile,
        stats: {
          visitorCount,
          interestsReceivedPending,
          interestsSentPending,
          interestsAccepted,
          unlocksPurchased,
          shortlistCount,
          unreadNotifications,
        },
        recentVisitors,
        recommendedMatches,
        activityTimeline: recentNotifications,
      },
      'Dashboard retrieved successfully',
    );
  }
}
