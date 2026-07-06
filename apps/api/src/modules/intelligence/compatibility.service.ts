import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildExtendedBreakdown,
  computeMandatoryOverlap,
  parseExtendedBreakdown,
} from './preference-matrix';
import { computeCompatibility, ScorableProfile } from './scorers';

const SCORABLE_INCLUDE = {
  islamicDetails: true,
  generalDetails: true,
  preference: true,
} as const;

export interface CompatibilityResult {
  overallPercent: number;
  mandatoryPercent: number;
  breakdown: unknown[];
  mandatoryBreakdown: unknown[];
}

@Injectable()
export class CompatibilityService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  private cacheKey(profileAId: number, profileBId: number): [number, number] {
    return profileAId < profileBId ? [profileAId, profileBId] : [profileBId, profileAId];
  }

  private computeFull(viewer: ScorableProfile, target: ScorableProfile): CompatibilityResult {
    const overall = computeCompatibility(viewer, target);
    const mandatory = computeMandatoryOverlap(viewer, target);

    return {
      overallPercent: overall.score,
      mandatoryPercent: mandatory.percent,
      breakdown: overall.breakdown,
      mandatoryBreakdown: mandatory.breakdown,
    };
  }

  /**
   * Returns a cached score, recomputing when either profile changed since the
   * cache entry was written.
   */
  async getOrComputeScore(
    viewerProfileId: number,
    targetProfileId: number,
  ): Promise<CompatibilityResult | null> {
    const [lowId, highId] = this.cacheKey(viewerProfileId, targetProfileId);
    const viewerIsLow = viewerProfileId === lowId;

    const [profileLow, profileHigh, cached] = await Promise.all([
      this.db.profile.findUnique({ where: { id: lowId }, include: SCORABLE_INCLUDE }),
      this.db.profile.findUnique({ where: { id: highId }, include: SCORABLE_INCLUDE }),
      this.db.matchScore.findUnique({
        where: { profileAId_profileBId: { profileAId: lowId, profileBId: highId } },
      }),
    ]);

    if (!profileLow || !profileHigh) return null;

    const viewer = (viewerIsLow ? profileLow : profileHigh) as ScorableProfile;
    const target = (viewerIsLow ? profileHigh : profileLow) as ScorableProfile;

    const stale =
      !cached ||
      cached.computedAt < profileLow.updatedAt ||
      cached.computedAt < profileHigh.updatedAt;

    if (!stale && cached) {
      const parsed = parseExtendedBreakdown(cached.breakdown);
      if (parsed) {
        return {
          overallPercent: cached.score,
          mandatoryPercent: parsed.mandatory.percent,
          breakdown: parsed.dimensions,
          mandatoryBreakdown: parsed.mandatory.breakdown,
        };
      }
    }

    const result = this.computeFull(viewer, target);
    const extended = buildExtendedBreakdown(
      result.breakdown as ReturnType<typeof computeCompatibility>['breakdown'],
      { percent: result.mandatoryPercent, breakdown: result.mandatoryBreakdown as never },
    );

    await this.db.matchScore.upsert({
      where: { profileAId_profileBId: { profileAId: lowId, profileBId: highId } },
      update: {
        score: result.overallPercent,
        breakdown: extended as unknown as Prisma.InputJsonValue,
        computedAt: new Date(),
      },
      create: {
        profileAId: lowId,
        profileBId: highId,
        score: result.overallPercent,
        breakdown: extended as unknown as Prisma.InputJsonValue,
      },
    });

    return result;
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
