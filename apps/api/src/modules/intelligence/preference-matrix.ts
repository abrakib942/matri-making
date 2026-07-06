import { EducationLevel, PrayerFrequency, ProfileMode, SmokingHabit } from '@prisma/client';
import type { DimensionScore, ScorableProfile } from './scorers';

const PRAYER_RANK: Record<PrayerFrequency, number> = {
  FIVE_TIMES_DAILY: 4,
  MOSTLY: 3,
  SOMETIMES: 2,
  RARELY: 1,
  NEVER: 0,
};

const EDUCATION_RANK: Record<EducationLevel, number> = {
  BELOW_SSC: 0,
  SSC: 1,
  HSC: 2,
  DIPLOMA: 3,
  BACHELORS: 4,
  MASTERS: 5,
  DOCTORATE: 6,
  MADRASA_QAWMI: 4,
  MADRASA_ALIA: 4,
  HAFEZ: 3,
  ALIM: 4,
  OTHER: 2,
};

export interface MandatoryOverlapResult {
  percent: number;
  breakdown: DimensionScore[];
}

function scorePrayerVsExpectation(
  actual: PrayerFrequency | null | undefined,
  expected: PrayerFrequency | null | undefined,
): number {
  if (!actual || !expected) return 70;
  const diff = PRAYER_RANK[actual] - PRAYER_RANK[expected];
  if (diff >= 0) return 100;
  if (diff === -1) return 60;
  return 20;
}

function scoreEnumMatch(a?: string | null, b?: string | null, partial = 50): number {
  if (!a || !b) return 70;
  return a === b ? 100 : partial;
}

function scoreEducationFit(
  actual: EducationLevel | null | undefined,
  expected: EducationLevel[] | undefined,
): number {
  if (!actual || !expected?.length) return 75;
  const rank = EDUCATION_RANK[actual];
  const minExpected = Math.min(...expected.map(e => EDUCATION_RANK[e]));
  if (rank >= minExpected) return 100;
  if (rank === minExpected - 1) return 65;
  return 30;
}

function scoreLocationFit(viewer: ScorableProfile, target: ScorableProfile): number {
  const pref = viewer.preference;
  if (!pref) return 75;

  if (pref.acceptsExpat && target.isExpat) return 100;
  if (target.districtId && pref.districtIds?.includes(target.districtId)) return 100;
  if (target.divisionId && pref.divisionIds?.includes(target.divisionId)) return 90;
  if (!pref.districtIds?.length && !pref.divisionIds?.length) return 80;
  return 40;
}

function scoreLifestyle(viewer: ScorableProfile, target: ScorableProfile): DimensionScore | null {
  const g = target.generalDetails;
  if (!g) return null;

  const scores: number[] = [];

  if (g.smoking === SmokingHabit.NEVER || g.smoking === SmokingHabit.QUIT) {
    scores.push(100);
  } else if (g.smoking === SmokingHabit.OCCASIONALLY) {
    scores.push(55);
  } else {
    scores.push(20);
  }

  if (g.drinking === 'NEVER' || g.drinking === 'QUIT') {
    scores.push(100);
  } else {
    scores.push(25);
  }

  const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return {
    key: 'lifestyle',
    score,
    weight: 1,
    reasonKey: score >= 80 ? 'LIFESTYLE_ALIGNED' : 'LIFESTYLE_MISMATCH',
  };
}

/** Mandatory overlap from viewer preferences → target profile facts. */
export function computeMandatoryOverlap(
  viewer: ScorableProfile,
  target: ScorableProfile,
): MandatoryOverlapResult {
  const breakdown: DimensionScore[] = [];

  if (viewer.mode === ProfileMode.ISLAMIC || target.mode === ProfileMode.ISLAMIC) {
    const islamic = target.islamicDetails;
    const pref = viewer.preference;

    breakdown.push({
      key: 'salah',
      score: scorePrayerVsExpectation(islamic?.prayerFrequency, pref?.minPrayerFrequency),
      weight: 1,
      reasonKey: 'SALAH_OVERLAP',
    });

    breakdown.push({
      key: 'hijab',
      score: scoreEnumMatch(islamic?.hijabStyle, pref?.hijabExpectation ?? undefined, 40),
      weight: 1,
      reasonKey: 'HIJAB_OVERLAP',
    });

    breakdown.push({
      key: 'aqeedah',
      score: scoreEnumMatch(islamic?.aqidah, viewer.islamicDetails?.aqidah, 45),
      weight: 1,
      reasonKey: 'AQEEDAH_OVERLAP',
    });

    breakdown.push({
      key: 'madhhab',
      score: scoreEnumMatch(islamic?.madhhab, viewer.islamicDetails?.madhhab, 55),
      weight: 1,
      reasonKey: 'MADHHAB_OVERLAP',
    });

    breakdown.push({
      key: 'islamicFinance',
      score: scoreEnumMatch(
        islamic?.viewsOnLoans ?? undefined,
        pref?.viewsOnLoansExpect ?? undefined,
        50,
      ),
      weight: 1,
      reasonKey: 'FINANCE_OVERLAP',
    });
  } else {
    breakdown.push({
      key: 'location',
      score: scoreLocationFit(viewer, target),
      weight: 1,
      reasonKey: 'LOCATION_OVERLAP',
    });

    breakdown.push({
      key: 'education',
      score: scoreEducationFit(target.educationLevel, viewer.preference?.educationLevels),
      weight: 1,
      reasonKey: 'EDUCATION_OVERLAP',
    });

    breakdown.push({
      key: 'profession',
      score:
        viewer.preference?.professionKeys?.length && target.professionKey
          ? viewer.preference.professionKeys.includes(target.professionKey)
            ? 100
            : 35
          : 75,
      weight: 1,
      reasonKey: 'PROFESSION_OVERLAP',
    });

    const lifestyle = scoreLifestyle(viewer, target);
    if (lifestyle) breakdown.push(lifestyle);
  }

  const percent = breakdown.length
    ? Math.round(breakdown.reduce((s, d) => s + d.score, 0) / breakdown.length)
    : 50;

  return { percent, breakdown };
}

export type ExtendedBreakdown = {
  dimensions: DimensionScore[];
  mandatory: MandatoryOverlapResult;
};

export function buildExtendedBreakdown(
  overall: DimensionScore[],
  mandatory: MandatoryOverlapResult,
): ExtendedBreakdown {
  return { dimensions: overall, mandatory };
}

export function parseExtendedBreakdown(raw: unknown): ExtendedBreakdown | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.dimensions) && obj.mandatory) {
    return obj as unknown as ExtendedBreakdown;
  }
  if (Array.isArray(raw)) {
    return { dimensions: raw as DimensionScore[], mandatory: { percent: 0, breakdown: [] } };
  }
  return null;
}
