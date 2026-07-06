import { createSuccessResult, ServiceResult } from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { CompatibilityService } from '@/modules/intelligence/compatibility.service';
import { FeatureGateService } from '@/modules/payment/feature-gate.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable } from '@nestjs/common';
import { PhotoPolicy, PrayerFrequency, Prisma } from '@prisma/client';
import { SearchProfilesDto } from './dto/index';
import { ISearchService } from './search.interface';

const PRAYER_ORDER: PrayerFrequency[] = [
  'FIVE_TIMES_DAILY',
  'MOSTLY',
  'SOMETIMES',
  'RARELY',
  'NEVER',
];

@Injectable()
export class PostgresSearchService implements ISearchService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  @Inject()
  private readonly featureGate: FeatureGateService;

  @Inject()
  private readonly compatibility: CompatibilityService;

  /** Strip premium-only filters when the viewer lacks advancedFilters entitlement. */
  private async applyFilterEntitlements(
    viewerUserId: number | null,
    dto: SearchProfilesDto,
  ): Promise<SearchProfilesDto> {
    if (!viewerUserId) {
      return {
        ...dto,
        incomeMin: undefined,
        incomeMax: undefined,
        languages: undefined,
        familyStatuses: undefined,
        minPrayerFrequency: undefined,
        hijabStyles: undefined,
        beardStyles: undefined,
        quranMemorization: undefined,
        madhhabs: undefined,
        aqidahs: undefined,
        verifiedOnly: undefined,
        premiumOnly: undefined,
        recentlyActiveDays: undefined,
        minMatchScore: undefined,
        sortBy: dto.sortBy === 'lastActive' ? undefined : dto.sortBy,
      };
    }

    const features = await this.featureGate.getFeatures(viewerUserId);

    if (features.advancedFilters) {
      return dto;
    }

    return {
      ...dto,
      incomeMin: undefined,
      incomeMax: undefined,
      languages: undefined,
      familyStatuses: undefined,
      minPrayerFrequency: undefined,
      hijabStyles: undefined,
      beardStyles: undefined,
      quranMemorization: undefined,
      madhhabs: undefined,
      aqidahs: undefined,
      verifiedOnly: undefined,
      premiumOnly: undefined,
      recentlyActiveDays: undefined,
      sortBy: dto.sortBy === 'lastActive' ? undefined : dto.sortBy,
    };
  }

  private prayerFrequenciesAtLeast(min: PrayerFrequency): PrayerFrequency[] {
    const index = PRAYER_ORDER.indexOf(min);
    return PRAYER_ORDER.slice(0, index + 1);
  }

  async searchProfiles(
    viewerUserId: number | null,
    dto: SearchProfilesDto,
  ): Promise<ServiceResult> {
    const filteredDto = await this.applyFilterEntitlements(viewerUserId, dto);
    const limit = filteredDto.limit ?? 20;

    // The viewer's own profiles are excluded; if the viewer has a profile,
    // results are locked to the opposite gender (gender-separated experience).
    const viewerMemberships = viewerUserId
      ? await this.db.profileMember.findMany({
          where: { userId: viewerUserId, inviteStatus: 'ACCEPTED' },
          include: { profile: { select: { id: true, gender: true } } },
        })
      : [];

    const viewerProfileIds = viewerMemberships.map(m => m.profile.id);
    const viewerGender = viewerMemberships[0]?.profile.gender;

    const targetGender = viewerGender
      ? viewerGender === 'MALE'
        ? ('FEMALE' as const)
        : ('MALE' as const)
      : filteredDto.gender;

    const viewer = viewerUserId
      ? await this.db.user.findUnique({
          where: { id: viewerUserId },
          select: { emailVerifiedAt: true, phoneVerifiedAt: true },
        })
      : null;
    const viewerIsVerified = !!viewer?.emailVerifiedAt && !!viewer?.phoneVerifiedAt;

    const blocks = viewerProfileIds.length
      ? await this.db.block.findMany({
          where: {
            OR: [
              { ownerProfileId: { in: viewerProfileIds } },
              { targetProfileId: { in: viewerProfileIds } },
            ],
          },
        })
      : [];

    const blockedProfileIds = new Set<number>();
    for (const block of blocks) {
      blockedProfileIds.add(block.ownerProfileId);
      blockedProfileIds.add(block.targetProfileId);
    }
    for (const id of viewerProfileIds) {
      blockedProfileIds.add(id);
    }

    const now = new Date();
    const where: Prisma.ProfileWhereInput = {
      status: 'ACTIVE',
      id: { notIn: Array.from(blockedProfileIds) },
      privacySettings: {
        visibility: viewerIsVerified ? { not: 'HIDDEN' } : { equals: 'PUBLIC' },
      },
    };

    if (filteredDto.biodataNo) {
      where.biodataNo = { equals: filteredDto.biodataNo.toUpperCase(), mode: 'insensitive' };
    }

    if (filteredDto.mode) where.mode = filteredDto.mode;
    if (targetGender) where.gender = targetGender;
    if (filteredDto.religion) where.religion = filteredDto.religion;

    if (filteredDto.ageMin !== undefined || filteredDto.ageMax !== undefined) {
      where.dateOfBirth = {};
      if (filteredDto.ageMin !== undefined) {
        where.dateOfBirth.lte = new Date(
          now.getFullYear() - filteredDto.ageMin,
          now.getMonth(),
          now.getDate(),
        );
      }
      if (filteredDto.ageMax !== undefined) {
        where.dateOfBirth.gte = new Date(
          now.getFullYear() - filteredDto.ageMax - 1,
          now.getMonth(),
          now.getDate(),
        );
      }
    }

    if (filteredDto.heightCmMin !== undefined || filteredDto.heightCmMax !== undefined) {
      where.heightCm = {};
      if (filteredDto.heightCmMin !== undefined) where.heightCm.gte = filteredDto.heightCmMin;
      if (filteredDto.heightCmMax !== undefined) where.heightCm.lte = filteredDto.heightCmMax;
    }

    if (filteredDto.maritalStatuses?.length)
      where.maritalStatus = { in: filteredDto.maritalStatuses };
    if (filteredDto.districtIds?.length) where.districtId = { in: filteredDto.districtIds };
    if (filteredDto.divisionIds?.length) where.divisionId = { in: filteredDto.divisionIds };
    if (filteredDto.upazilaIds?.length) where.upazilaId = { in: filteredDto.upazilaIds };
    if (filteredDto.isExpat !== undefined) where.isExpat = filteredDto.isExpat;
    if (filteredDto.educationLevels?.length)
      where.educationLevel = { in: filteredDto.educationLevels };
    if (filteredDto.professionKeys?.length)
      where.professionKey = { in: filteredDto.professionKeys };

    if (filteredDto.incomeMin !== undefined || filteredDto.incomeMax !== undefined) {
      where.monthlyIncomeBdt = {};
      if (filteredDto.incomeMin !== undefined) where.monthlyIncomeBdt.gte = filteredDto.incomeMin;
      if (filteredDto.incomeMax !== undefined) where.monthlyIncomeBdt.lte = filteredDto.incomeMax;
    }

    if (filteredDto.withoutChildren) {
      where.OR = [{ childrenCount: 0 }, { childrenCount: null }];
    }

    if (filteredDto.languages?.length) where.languages = { hasSome: filteredDto.languages };
    if (filteredDto.familyStatuses?.length) where.familyStatus = { in: filteredDto.familyStatuses };

    // Islamic filters
    const islamicWhere: Prisma.IslamicProfileDetailsWhereInput = {};
    if (filteredDto.minPrayerFrequency) {
      islamicWhere.prayerFrequency = {
        in: this.prayerFrequenciesAtLeast(filteredDto.minPrayerFrequency),
      };
    }
    if (filteredDto.hijabStyles?.length) islamicWhere.hijabStyle = { in: filteredDto.hijabStyles };
    if (filteredDto.beardStyles?.length) islamicWhere.beardStyle = { in: filteredDto.beardStyles };
    if (filteredDto.quranMemorization?.length) {
      islamicWhere.quranMemorization = { in: filteredDto.quranMemorization };
    }
    if (filteredDto.madhhabs?.length) islamicWhere.madhhab = { in: filteredDto.madhhabs };
    if (filteredDto.aqidahs?.length) islamicWhere.aqidah = { in: filteredDto.aqidahs };

    if (Object.keys(islamicWhere).length > 0) {
      where.islamicDetails = islamicWhere;
    }

    if (filteredDto.verifiedOnly) {
      where.verificationBadges = { array_contains: ['NID'] };
    }

    if (filteredDto.premiumOnly) {
      where.isPremium = true;
    }

    if (filteredDto.recentlyActiveDays) {
      where.lastActiveAt = {
        gte: new Date(Date.now() - filteredDto.recentlyActiveDays * 24 * 60 * 60 * 1000),
      };
    }

    const orderBy: Prisma.ProfileOrderByWithRelationInput[] =
      filteredDto.sortBy === 'lastActive'
        ? [
            { boostedUntil: { sort: 'desc', nulls: 'last' } },
            { lastActiveAt: 'desc' },
            { id: 'desc' },
          ]
        : [{ boostedUntil: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }];

    const profiles = await this.db.profile.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(filteredDto.cursor ? { cursor: { id: filteredDto.cursor }, skip: 1 } : {}),
      include: {
        privacySettings: true,
        media: { where: { isPrimary: true, type: 'PHOTO' }, take: 1 },
        islamicDetails: {
          select: { prayerFrequency: true, madhhab: true, quranMemorization: true },
        },
      },
    });

    const hasMore = profiles.length > limit;
    const rawItems = hasMore ? profiles.slice(0, limit) : profiles;

    const viewerProfileId = viewerProfileIds[0] ?? null;
    let cards = await Promise.all(
      rawItems.map(async profile => {
        const card = this.toCard(profile);
        if (!viewerProfileId) return card;

        const scores = await this.compatibility.getOrComputeScore(viewerProfileId, profile.id);
        if (!scores) return card;

        return {
          ...card,
          mandatoryMatchPercent: scores.mandatoryPercent,
          overallMatchPercent: scores.overallPercent,
        };
      }),
    );

    if (filteredDto.minMatchScore != null && viewerProfileId) {
      cards = cards.filter(
        c =>
          (c as { mandatoryMatchPercent?: number }).mandatoryMatchPercent != null &&
          (c as { mandatoryMatchPercent: number }).mandatoryMatchPercent >=
            filteredDto.minMatchScore!,
      );
    }

    return createSuccessResult(
      {
        items: cards,
        nextCursor: hasMore ? rawItems[rawItems.length - 1].id : null,
      },
      'Profiles retrieved successfully',
    );
  }

  /**
   * Privacy-safe card projection for list views: only unlock-independent
   * fields; photos follow the photo policy (blurred variant at most).
   */
  private toCard(
    profile: Prisma.ProfileGetPayload<{
      include: {
        privacySettings: true;
        media: true;
        islamicDetails: {
          select: { prayerFrequency: true; madhhab: true; quranMemorization: true };
        };
      };
    }>,
  ) {
    const policy: PhotoPolicy = profile.privacySettings?.photoPolicy ?? 'ON_UNLOCK';
    const primary = profile.media[0];

    let photoUrl: string | null = null;
    if (primary) {
      if (policy === 'VISIBLE') photoUrl = primary.url;
      else if (policy === 'BLURRED') photoUrl = primary.blurredUrl;
    }

    const age = Math.floor(
      (Date.now() - profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );

    const hideLocation = profile.privacySettings?.hideLocation ?? false;

    return {
      id: profile.id,
      biodataNo: profile.biodataNo,
      mode: profile.mode,
      gender: profile.gender,
      age,
      heightCm: profile.heightCm,
      maritalStatus: profile.maritalStatus,
      districtId: hideLocation ? null : profile.districtId,
      divisionId: hideLocation ? null : profile.divisionId,
      isExpat: profile.isExpat,
      educationLevel: profile.educationLevel,
      professionKey: profile.professionKey,
      greenFlags: profile.greenFlags,
      verificationBadges: profile.verificationBadges,
      completionPercent: profile.completionPercent,
      isPremium: profile.isPremium,
      lastActiveAt: profile.lastActiveAt,
      viewCount: profile.viewCount,
      birthYear: profile.dateOfBirth.getFullYear(),
      photoUrl,
      islamic: profile.islamicDetails,
    };
  }
}
