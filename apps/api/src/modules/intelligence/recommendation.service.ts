import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CompatibilityService } from './compatibility.service';

const CANDIDATE_POOL_SIZE = 50;
const RESULT_SIZE = 12;

@Injectable()
export class RecommendationService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  @Inject()
  private readonly compatibility: CompatibilityService;

  /**
   * Blends rule-based compatibility with activity recency and mutual signals
   * (interest already shown by the other side ranks higher).
   */
  async getRecommendations(userId: number): Promise<ServiceResult> {
    const profileId = await this.access.getPrimaryProfileId(userId);

    if (!profileId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Create a biodata to get recommendations' },
        'Create a biodata to get recommendations',
      );
    }

    const me = await this.db.profile.findUnique({
      where: { id: profileId },
      include: { preference: true },
    });

    if (!me) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    const oppositeGender = me.gender === 'MALE' ? 'FEMALE' : 'MALE';

    // Exclusions: blocked either way, and already-interacted profiles.
    const [blocks, interests] = await Promise.all([
      this.db.block.findMany({
        where: { OR: [{ ownerProfileId: profileId }, { targetProfileId: profileId }] },
      }),
      this.db.interest.findMany({
        where: {
          OR: [{ fromProfileId: profileId }, { toProfileId: profileId }],
          status: { in: ['PENDING', 'ACCEPTED', 'REJECTED'] },
        },
      }),
    ]);

    const excluded = new Set<number>([profileId]);
    for (const b of blocks) {
      excluded.add(b.ownerProfileId);
      excluded.add(b.targetProfileId);
    }
    const mutualInterestProfileIds = new Set<number>();
    for (const i of interests) {
      if (i.fromProfileId === profileId) {
        excluded.add(i.toProfileId);
      } else if (i.status === 'PENDING') {
        // They showed interest in us: strong mutual signal, keep them in pool.
        mutualInterestProfileIds.add(i.fromProfileId);
      } else {
        excluded.add(i.fromProfileId);
      }
    }

    const where: Prisma.ProfileWhereInput = {
      status: 'ACTIVE',
      mode: me.mode,
      gender: oppositeGender,
      id: { notIn: Array.from(excluded) },
      privacySettings: { visibility: { not: 'HIDDEN' } },
    };

    // Soft preference filters: age range only (hard filters would starve the pool).
    const pref = me.preference;
    if (
      pref?.ageMin !== null &&
      pref?.ageMin !== undefined &&
      pref?.ageMax !== null &&
      pref?.ageMax !== undefined
    ) {
      const now = new Date();
      where.dateOfBirth = {
        lte: new Date(now.getFullYear() - pref.ageMin + 1, now.getMonth(), now.getDate()),
        gte: new Date(now.getFullYear() - pref.ageMax - 2, now.getMonth(), now.getDate()),
      };
    }

    const candidates = await this.db.profile.findMany({
      where,
      orderBy: { lastActiveAt: 'desc' },
      take: CANDIDATE_POOL_SIZE,
      select: {
        id: true,
        biodataNo: true,
        mode: true,
        gender: true,
        dateOfBirth: true,
        heightCm: true,
        maritalStatus: true,
        districtId: true,
        divisionId: true,
        educationLevel: true,
        professionKey: true,
        greenFlags: true,
        verificationBadges: true,
        completionPercent: true,
        isPremium: true,
        lastActiveAt: true,
      },
    });

    const now = Date.now();

    const scored = await Promise.all(
      candidates.map(async candidate => {
        const compat = await this.compatibility.getOrComputeScore(profileId, candidate.id);
        const compatScore = compat?.score ?? 50;

        const daysSinceActive = (now - candidate.lastActiveAt.getTime()) / (24 * 60 * 60 * 1000);
        const recencyScore = Math.max(0, 100 - daysSinceActive * 5);

        const mutualBoost = mutualInterestProfileIds.has(candidate.id) ? 15 : 0;

        const blended = Math.min(
          100,
          Math.round(compatScore * 0.7 + recencyScore * 0.3 + mutualBoost),
        );

        const age = Math.floor(
          (now - candidate.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
        );

        const { dateOfBirth, ...card } = candidate;

        return {
          ...card,
          age,
          compatibilityScore: compatScore,
          compatibilityBreakdown: compat?.breakdown ?? [],
          recommendationScore: blended,
          hasShownInterest: mutualInterestProfileIds.has(candidate.id),
        };
      }),
    );

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return createSuccessResult(scored.slice(0, RESULT_SIZE), 'Recommendations computed');
  }
}
