import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { computeCompatibility, ScorableProfile } from './scorers';

const SCORABLE_INCLUDE = {
  islamicDetails: true,
  generalDetails: true,
  preference: true,
} as const;

@Injectable()
export class CompatibilityService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  private cacheKey(profileAId: number, profileBId: number): [number, number] {
    return profileAId < profileBId ? [profileAId, profileBId] : [profileBId, profileAId];
  }

  /**
   * Returns a cached score, recomputing when either profile changed since the
   * cache entry was written.
   */
  async getOrComputeScore(
    profileAId: number,
    profileBId: number,
  ): Promise<{ score: number; breakdown: unknown } | null> {
    const [lowId, highId] = this.cacheKey(profileAId, profileBId);

    const [profileA, profileB, cached] = await Promise.all([
      this.db.profile.findUnique({ where: { id: lowId }, include: SCORABLE_INCLUDE }),
      this.db.profile.findUnique({ where: { id: highId }, include: SCORABLE_INCLUDE }),
      this.db.matchScore.findUnique({
        where: { profileAId_profileBId: { profileAId: lowId, profileBId: highId } },
      }),
    ]);

    if (!profileA || !profileB) return null;

    const stale =
      !cached || cached.computedAt < profileA.updatedAt || cached.computedAt < profileB.updatedAt;

    if (!stale) {
      return { score: cached.score, breakdown: cached.breakdown };
    }

    const result = computeCompatibility(profileA as ScorableProfile, profileB as ScorableProfile);

    await this.db.matchScore.upsert({
      where: { profileAId_profileBId: { profileAId: lowId, profileBId: highId } },
      update: {
        score: result.score,
        breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
        computedAt: new Date(),
      },
      create: {
        profileAId: lowId,
        profileBId: highId,
        score: result.score,
        breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
      },
    });

    return { score: result.score, breakdown: result.breakdown };
  }

  async getCompatibility(viewerUserId: number, targetProfileId: number): Promise<ServiceResult> {
    const viewerProfileId = await this.access.getPrimaryProfileId(viewerUserId);

    if (!viewerProfileId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Create a biodata to see compatibility scores' },
        'Create a biodata to see compatibility scores',
      );
    }

    if (viewerProfileId === targetProfileId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Cannot compute compatibility with your own profile' },
        'Cannot compute compatibility with your own profile',
      );
    }

    const result = await this.getOrComputeScore(viewerProfileId, targetProfileId);

    if (!result) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    return createSuccessResult(result, 'Compatibility computed successfully');
  }
}
