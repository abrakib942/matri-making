import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';
import { InsightSeverity, Prisma } from '@prisma/client';

interface Insight {
  key: string;
  severity: InsightSeverity;
  data: Record<string, unknown>;
}

/**
 * Private "red flags": visible only to the profile owner. Compares the
 * owner's partner preference against the live member distribution and
 * surfaces profile-improvement hints.
 */
@Injectable()
export class InsightService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  async computeForProfile(profileId: number): Promise<Insight[]> {
    const profile = await this.db.profile.findUnique({
      where: { id: profileId },
      include: { preference: true, media: true, islamicDetails: true },
    });

    if (!profile) return [];

    const insights: Insight[] = [];
    const pref = profile.preference;
    const oppositeGender = profile.gender === 'MALE' ? 'FEMALE' : 'MALE';

    const poolWhere: Prisma.ProfileWhereInput = {
      status: 'ACTIVE',
      gender: oppositeGender,
      mode: profile.mode,
    };

    const totalPool = await this.db.profile.count({ where: poolWhere });

    if (pref && totalPool >= 10) {
      const now = new Date();
      const filtered: Prisma.ProfileWhereInput = { ...poolWhere };

      if (pref.ageMin !== null && pref.ageMax !== null) {
        filtered.dateOfBirth = {
          lte: new Date(now.getFullYear() - pref.ageMin, now.getMonth(), now.getDate()),
          gte: new Date(now.getFullYear() - pref.ageMax - 1, now.getMonth(), now.getDate()),
        };
      }
      if (pref.districtIds.length) filtered.districtId = { in: pref.districtIds };
      if (pref.educationLevels.length) filtered.educationLevel = { in: pref.educationLevels };
      if (pref.maritalStatuses.length) filtered.maritalStatus = { in: pref.maritalStatuses };

      const matching = await this.db.profile.count({ where: filtered });
      const matchPercent = Math.round((matching / totalPool) * 100);

      if (matchPercent <= 10) {
        insights.push({
          key: 'PREFERENCE_TOO_NARROW',
          severity: 'CRITICAL',
          data: { matchPercent, excludedPercent: 100 - matchPercent, matching, totalPool },
        });
      } else if (matchPercent <= 30) {
        insights.push({
          key: 'PREFERENCE_NARROW',
          severity: 'WARNING',
          data: { matchPercent, excludedPercent: 100 - matchPercent, matching, totalPool },
        });
      }

      if (pref.ageMin !== null && pref.ageMax !== null && pref.ageMax - pref.ageMin < 3) {
        insights.push({
          key: 'AGE_RANGE_NARROW',
          severity: 'WARNING',
          data: { ageMin: pref.ageMin, ageMax: pref.ageMax },
        });
      }

      if (pref.districtIds.length > 0 && pref.districtIds.length <= 2) {
        insights.push({
          key: 'LOCATION_FILTER_STRICT',
          severity: 'INFO',
          data: { districtCount: pref.districtIds.length },
        });
      }
    }

    if (!pref) {
      insights.push({ key: 'NO_PARTNER_PREFERENCE', severity: 'WARNING', data: {} });
    }

    if (profile.completionPercent < 70) {
      insights.push({
        key: 'LOW_PROFILE_COMPLETION',
        severity: profile.completionPercent < 40 ? 'CRITICAL' : 'WARNING',
        data: { completionPercent: profile.completionPercent },
      });
    }

    if (profile.mode === 'GENERAL' && profile.media.length === 0) {
      insights.push({ key: 'NO_PHOTO', severity: 'INFO', data: {} });
    }

    if (!profile.contactPhone && !profile.contactEmail) {
      insights.push({ key: 'NO_CONTACT_INFO', severity: 'WARNING', data: {} });
    }

    if (
      profile.mode === 'ISLAMIC' &&
      profile.gender === 'FEMALE' &&
      !profile.islamicDetails?.waliName
    ) {
      insights.push({ key: 'NO_WALI_INFO', severity: 'WARNING', data: {} });
    }

    // Persist: replace the profile's insight set atomically.
    await this.db.$transaction([
      this.db.profileInsight.deleteMany({ where: { profileId } }),
      this.db.profileInsight.createMany({
        data: insights.map(insight => ({
          profileId,
          key: insight.key,
          severity: insight.severity,
          data: insight.data as Prisma.InputJsonValue,
        })),
      }),
    ]);

    return insights;
  }

  async getMyInsights(userId: number): Promise<ServiceResult> {
    const profileId = await this.access.getPrimaryProfileId(userId);

    if (!profileId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Create a biodata to see insights' },
        'Create a biodata to see insights',
      );
    }

    const insights = await this.computeForProfile(profileId);

    return createSuccessResult(insights, 'Insights computed successfully');
  }
}
