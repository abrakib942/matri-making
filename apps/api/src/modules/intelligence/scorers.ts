import { EducationLevel, PrayerFrequency, Prisma } from '@prisma/client';

export type ScorableProfile = Prisma.ProfileGetPayload<{
  include: { islamicDetails: true; generalDetails: true; preference: true };
}>;

export interface DimensionScore {
  key: string;
  score: number; // 0..100
  weight: number;
  reasonKey: string; // i18n key explaining the result
}

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

function ageOf(profile: ScorableProfile): number {
  return Math.floor((Date.now() - profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function overlap<T>(a: T[], b: T[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  return a.filter(item => setB.has(item)).length;
}

type Scorer = (a: ScorableProfile, b: ScorableProfile) => DimensionScore | null;

/**
 * Religion & practice: for Islamic-mode pairs this compares prayer frequency,
 * aqidah/madhhab alignment, and modesty expectations; otherwise religion match.
 */
const religionPractice: Scorer = (a, b) => {
  if (a.religion !== b.religion) {
    return { key: 'religionPractice', score: 0, weight: 20, reasonKey: 'DIFFERENT_RELIGION' };
  }

  const da = a.islamicDetails;
  const db = b.islamicDetails;

  if (!da || !db) {
    return { key: 'religionPractice', score: 80, weight: 12, reasonKey: 'SAME_RELIGION' };
  }

  let score = 0;
  let parts = 0;

  if (da.prayerFrequency && db.prayerFrequency) {
    const diff = Math.abs(PRAYER_RANK[da.prayerFrequency] - PRAYER_RANK[db.prayerFrequency]);
    score += Math.max(0, 100 - diff * 25);
    parts += 1;
  }

  if (da.aqidah && db.aqidah) {
    score += da.aqidah === db.aqidah ? 100 : 50;
    parts += 1;
  }

  if (da.madhhab && db.madhhab) {
    score += da.madhhab === db.madhhab ? 100 : 60;
    parts += 1;
  }

  if (parts === 0) {
    return { key: 'religionPractice', score: 70, weight: 12, reasonKey: 'SAME_RELIGION' };
  }

  const final = Math.round(score / parts);

  return {
    key: 'religionPractice',
    score: final,
    weight: 20,
    reasonKey:
      final >= 80
        ? 'STRONG_DEEN_ALIGNMENT'
        : final >= 50
          ? 'MODERATE_DEEN_ALIGNMENT'
          : 'WEAK_DEEN_ALIGNMENT',
  };
};

/** Modesty expectations: beard/hijab wishes vs reality (Islamic mode). */
const modestyExpectations: Scorer = (a, b) => {
  const male = a.gender === 'MALE' ? a : b;
  const female = a.gender === 'FEMALE' ? a : b;

  const checks: number[] = [];

  const beardWish = female.preference?.beardExpectation;
  if (beardWish && male.islamicDetails?.beardStyle) {
    checks.push(male.islamicDetails.beardStyle === beardWish ? 100 : 40);
  }

  const hijabWish = male.preference?.hijabExpectation;
  if (hijabWish && female.islamicDetails?.hijabStyle) {
    checks.push(female.islamicDetails.hijabStyle === hijabWish ? 100 : 40);
  }

  if (!checks.length) return null;

  const score = Math.round(checks.reduce((s, v) => s + v, 0) / checks.length);

  return {
    key: 'modestyExpectations',
    score,
    weight: 8,
    reasonKey: score >= 80 ? 'MODESTY_EXPECTATIONS_MET' : 'MODESTY_EXPECTATIONS_PARTIAL',
  };
};

/** Family values & status alignment. */
const values: Scorer = (a, b) => {
  const checks: number[] = [];

  if (a.familyValues && b.familyValues) {
    checks.push(a.familyValues === b.familyValues ? 100 : 55);
  }

  if (a.familyStatus && b.familyStatus) {
    const order = [
      'LOWER_CLASS',
      'LOWER_MIDDLE_CLASS',
      'MIDDLE_CLASS',
      'UPPER_MIDDLE_CLASS',
      'UPPER_CLASS',
    ];
    const diff = Math.abs(order.indexOf(a.familyStatus) - order.indexOf(b.familyStatus));
    checks.push(Math.max(0, 100 - diff * 25));
  }

  if (!checks.length) return null;

  const score = Math.round(checks.reduce((s, v) => s + v, 0) / checks.length);

  return {
    key: 'values',
    score,
    weight: 12,
    reasonKey: score >= 80 ? 'SIMILAR_FAMILY_VALUES' : 'DIFFERENT_FAMILY_VALUES',
  };
};

/** Education level proximity. */
const education: Scorer = (a, b) => {
  if (!a.educationLevel || !b.educationLevel) return null;

  const diff = Math.abs(EDUCATION_RANK[a.educationLevel] - EDUCATION_RANK[b.educationLevel]);
  const score = Math.max(0, 100 - diff * 18);

  return {
    key: 'education',
    score,
    weight: 10,
    reasonKey: score >= 80 ? 'SIMILAR_EDUCATION' : 'DIFFERENT_EDUCATION',
  };
};

/** Career & financial fit against stated preferences. */
const career: Scorer = (a, b) => {
  const checks: number[] = [];

  if (a.preference?.professionKeys?.length && b.professionKey) {
    checks.push(a.preference.professionKeys.includes(b.professionKey) ? 100 : 40);
  }
  if (b.preference?.professionKeys?.length && a.professionKey) {
    checks.push(b.preference.professionKeys.includes(a.professionKey) ? 100 : 40);
  }

  if (!checks.length) return null;

  const score = Math.round(checks.reduce((s, v) => s + v, 0) / checks.length);

  return {
    key: 'career',
    score,
    weight: 8,
    reasonKey: score >= 80 ? 'CAREER_MATCHES_PREFERENCE' : 'CAREER_DIFFERS_FROM_PREFERENCE',
  };
};

/** Mutual age & height preference fit. */
const ageHeightFit: Scorer = (a, b) => {
  const checks: number[] = [];

  const fits = (profile: ScorableProfile, other: ScorableProfile) => {
    const pref = profile.preference;
    if (!pref) return;

    const otherAge = ageOf(other);
    if (pref.ageMin !== null && pref.ageMax !== null) {
      checks.push(otherAge >= pref.ageMin && otherAge <= pref.ageMax ? 100 : 30);
    }

    if (pref.heightCmMin !== null && pref.heightCmMax !== null && other.heightCm !== null) {
      checks.push(
        other.heightCm >= pref.heightCmMin && other.heightCm <= pref.heightCmMax ? 100 : 40,
      );
    }
  };

  fits(a, b);
  fits(b, a);

  if (!checks.length) return null;

  const score = Math.round(checks.reduce((s, v) => s + v, 0) / checks.length);

  return {
    key: 'ageHeightFit',
    score,
    weight: 10,
    reasonKey: score >= 80 ? 'AGE_HEIGHT_WITHIN_PREFERENCE' : 'AGE_HEIGHT_OUTSIDE_PREFERENCE',
  };
};

/** Lifestyle alignment (smoking, diet). */
const lifestyle: Scorer = (a, b) => {
  const da = a.generalDetails;
  const db = b.generalDetails;

  if (!da || !db) return null;

  const checks: number[] = [];

  if (da.smoking && db.smoking) {
    const clean = (s: string) => s === 'NEVER' || s === 'QUIT';
    checks.push(clean(da.smoking) === clean(db.smoking) ? 100 : 40);
  }

  if (da.diet && db.diet) {
    checks.push(da.diet === db.diet ? 100 : 60);
  }

  const shared = overlap(da.interests, db.interests) + overlap(da.hobbies, db.hobbies);
  if (da.interests.length || db.interests.length || da.hobbies.length || db.hobbies.length) {
    checks.push(Math.min(100, shared * 25));
  }

  if (!checks.length) return null;

  const score = Math.round(checks.reduce((s, v) => s + v, 0) / checks.length);

  return {
    key: 'lifestyle',
    score,
    weight: 10,
    reasonKey: score >= 70 ? 'COMPATIBLE_LIFESTYLE' : 'DIFFERENT_LIFESTYLE',
  };
};

/** Location proximity, considering location preferences. */
const location: Scorer = (a, b) => {
  let score: number;
  let reasonKey: string;

  if (a.districtId && b.districtId && a.districtId === b.districtId) {
    score = 100;
    reasonKey = 'SAME_DISTRICT';
  } else if (a.divisionId && b.divisionId && a.divisionId === b.divisionId) {
    score = 80;
    reasonKey = 'SAME_DIVISION';
  } else if (a.districtId && b.districtId) {
    score = 40;
    reasonKey = 'DIFFERENT_DIVISION';
  } else {
    return null;
  }

  // Preference override: if the other's district is explicitly wanted, boost.
  if (b.districtId && a.preference?.districtIds?.includes(b.districtId)) {
    score = Math.max(score, 90);
    reasonKey = 'PREFERRED_LOCATION';
  }

  return { key: 'location', score, weight: 8, reasonKey };
};

/** Shared languages. */
const language: Scorer = (a, b) => {
  if (!a.languages.length || !b.languages.length) return null;

  const shared = overlap(a.languages, b.languages);
  const score = shared > 0 ? Math.min(100, 60 + shared * 20) : 20;

  return {
    key: 'language',
    score,
    weight: 6,
    reasonKey: shared > 0 ? 'SHARED_LANGUAGES' : 'NO_SHARED_LANGUAGE',
  };
};

/** Marital status & children acceptance. */
const familyExpectations: Scorer = (a, b) => {
  const checks: number[] = [];

  const statusFits = (profile: ScorableProfile, other: ScorableProfile) => {
    const pref = profile.preference;
    if (pref?.maritalStatuses?.length) {
      checks.push(pref.maritalStatuses.includes(other.maritalStatus) ? 100 : 20);
    }
    if (pref?.acceptsChildren !== null && pref?.acceptsChildren !== undefined) {
      const hasChildren = (other.childrenCount ?? 0) > 0;
      checks.push(!hasChildren || pref.acceptsChildren ? 100 : 10);
    }
    if (pref?.acceptsExpat !== null && pref?.acceptsExpat !== undefined) {
      checks.push(!other.isExpat || pref.acceptsExpat ? 100 : 30);
    }
  };

  statusFits(a, b);
  statusFits(b, a);

  if (!checks.length) return null;

  const score = Math.round(checks.reduce((s, v) => s + v, 0) / checks.length);

  return {
    key: 'familyExpectations',
    score,
    weight: 10,
    reasonKey: score >= 80 ? 'FAMILY_EXPECTATIONS_MET' : 'FAMILY_EXPECTATIONS_CONFLICT',
  };
};

/** Future goals: both articulated goals is a weak positive signal. */
const futureGoals: Scorer = (a, b) => {
  if (!a.futureGoals && !b.futureGoals) return null;

  const score = a.futureGoals && b.futureGoals ? 75 : 50;

  return {
    key: 'futureGoals',
    score,
    weight: 4,
    reasonKey: score >= 75 ? 'BOTH_HAVE_GOALS' : 'GOALS_PARTIALLY_STATED',
  };
};

const SCORERS: Scorer[] = [
  religionPractice,
  modestyExpectations,
  values,
  education,
  career,
  ageHeightFit,
  lifestyle,
  location,
  language,
  familyExpectations,
  futureGoals,
];

export interface CompatibilityResult {
  score: number;
  breakdown: DimensionScore[];
}

export function computeCompatibility(a: ScorableProfile, b: ScorableProfile): CompatibilityResult {
  const breakdown = SCORERS.map(scorer => scorer(a, b)).filter(
    (d): d is DimensionScore => d !== null,
  );

  if (!breakdown.length) {
    return { score: 50, breakdown: [] };
  }

  const totalWeight = breakdown.reduce((sum, d) => sum + d.weight, 0);
  const weighted = breakdown.reduce((sum, d) => sum + d.score * d.weight, 0);

  return {
    score: Math.round(weighted / totalWeight),
    breakdown,
  };
}
