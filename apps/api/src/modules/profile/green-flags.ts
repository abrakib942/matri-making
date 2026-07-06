import { Prisma } from '@prisma/client';

type ProfileWithDetails = Prisma.ProfileGetPayload<{
  include: { islamicDetails: true; generalDetails: true };
}>;

interface FlagRule {
  key: string;
  applies: (profile: ProfileWithDetails) => boolean;
}

/**
 * Deterministic green-flag registry, evaluated on every profile save.
 * Keys are i18n message keys; clients translate them for display.
 */
const FLAG_RULES: FlagRule[] = [
  {
    key: 'PRAYS_REGULARLY',
    applies: p =>
      p.islamicDetails?.prayerFrequency === 'FIVE_TIMES_DAILY' ||
      p.islamicDetails?.prayerFrequency === 'MOSTLY',
  },
  {
    key: 'QURAN_STUDENT',
    applies: p =>
      !!p.islamicDetails?.quranMemorization &&
      ['FULL_HAFEZ', 'MULTIPLE_JUZ', 'LEARNING'].includes(p.islamicDetails.quranMemorization),
  },
  {
    key: 'HAFEZ',
    applies: p => p.islamicDetails?.quranMemorization === 'FULL_HAFEZ',
  },
  {
    key: 'SUNNAH_BEARD',
    applies: p => p.gender === 'MALE' && p.islamicDetails?.beardStyle === 'FULL_SUNNAH',
  },
  {
    key: 'OBSERVES_PURDAH',
    applies: p =>
      p.gender === 'FEMALE' &&
      !!p.islamicDetails?.hijabStyle &&
      ['NIQAB_WITH_ABAYA', 'HIJAB_WITH_ABAYA'].includes(p.islamicDetails.hijabStyle),
  },
  {
    key: 'ISLAMICALLY_ACTIVE',
    applies: p => !!p.islamicDetails?.islamicActivities || !!p.islamicDetails?.dawahInvolvement,
  },
  {
    key: 'WALI_INVOLVED',
    applies: p => !!p.islamicDetails?.waliName && p.islamicDetails?.waliApproves === true,
  },
  {
    key: 'NON_SMOKER',
    applies: p =>
      p.mode === 'ISLAMIC'
        ? p.generalDetails?.smoking !== 'REGULARLY'
        : p.generalDetails?.smoking === 'NEVER' || p.generalDetails?.smoking === 'QUIT',
  },
  {
    key: 'FAMILY_ORIENTED',
    applies: p => p.familyValues === 'TRADITIONAL' || p.familyValues === 'RELIGIOUS',
  },
  {
    key: 'FINANCIALLY_STABLE',
    applies: p => (p.monthlyIncomeBdt ?? 0) >= 30000,
  },
  {
    key: 'HIGHLY_EDUCATED',
    applies: p =>
      !!p.educationLevel && ['BACHELORS', 'MASTERS', 'DOCTORATE'].includes(p.educationLevel),
  },
  {
    key: 'ISLAMIC_EDUCATION',
    applies: p =>
      (!!p.educationLevel &&
        ['MADRASA_QAWMI', 'MADRASA_ALIA', 'HAFEZ', 'ALIM'].includes(p.educationLevel)) ||
      !!p.islamicDetails?.islamicEducation,
  },
  {
    key: 'MULTILINGUAL',
    applies: p => (p.languages?.length ?? 0) >= 2,
  },
  {
    key: 'TRAVELS_OCCASIONALLY',
    applies: p => !!p.generalDetails?.travelPreference,
  },
  {
    key: 'DETAILED_PROFILE',
    applies: p => (p.aboutMe?.length ?? 0) >= 200,
  },
];

// NON_SMOKER for Islamic profiles requires general details to be meaningful;
// treat missing lifestyle data as "unknown", not a flag.
export function computeGreenFlags(profile: ProfileWithDetails): string[] {
  return FLAG_RULES.filter(rule => {
    if (rule.key === 'NON_SMOKER' && !profile.generalDetails) {
      return false;
    }
    try {
      return rule.applies(profile);
    } catch {
      return false;
    }
  }).map(rule => rule.key);
}

/**
 * Weighted profile-completion percentage across biodata sections.
 */
export function computeCompletionPercent(
  profile: ProfileWithDetails & {
    preference: unknown | null;
    media: unknown[];
  },
): number {
  let score = 0;

  // Basics — 20
  const basics = [
    profile.fullName,
    profile.dateOfBirth,
    profile.heightCm,
    profile.maritalStatus,
    profile.complexion,
  ];
  score += Math.round((basics.filter(Boolean).length / basics.length) * 20);

  // Location — 10
  const location = [profile.districtId ?? profile.countryId, profile.permanentAddress];
  score += Math.round((location.filter(Boolean).length / location.length) * 10);

  // Education & career — 15
  const career = [profile.educationLevel, profile.professionKey, profile.monthlyIncomeBdt];
  score += Math.round(
    (career.filter(v => v !== null && v !== undefined).length / career.length) * 15,
  );

  // Family — 15
  const family = [
    profile.fatherAlive !== null && profile.fatherAlive !== undefined,
    profile.motherAlive !== null && profile.motherAlive !== undefined,
    profile.brothersCount !== null && profile.brothersCount !== undefined,
    profile.familyStatus,
    profile.familyDetails,
  ];
  score += Math.round((family.filter(Boolean).length / family.length) * 15);

  // Free text — 10
  const freeText = [profile.aboutMe, profile.partnerExpectation];
  score += Math.round((freeText.filter(Boolean).length / freeText.length) * 10);

  // Contact — 10
  const contact = [profile.contactPhone, profile.contactEmail];
  score += Math.round((contact.filter(Boolean).length / contact.length) * 10);

  // Mode-specific details — 15
  if (profile.mode === 'ISLAMIC' && profile.islamicDetails) {
    const d = profile.islamicDetails;
    const fields = [
      d.aqidah,
      d.madhhab,
      d.prayerFrequency,
      profile.gender === 'MALE' ? d.beardStyle : d.hijabStyle,
      d.quranRecitation,
      d.marriageExpectations,
      d.waliName,
    ];
    score += Math.round((fields.filter(Boolean).length / fields.length) * 15);
  } else if (profile.mode === 'GENERAL' && profile.generalDetails) {
    const d = profile.generalDetails;
    const fields = [
      d.smoking,
      d.diet,
      d.interests.length > 0,
      d.hobbies.length > 0,
      d.personalityTraits.length > 0,
      d.careerGoals,
    ];
    score += Math.round((fields.filter(Boolean).length / fields.length) * 15);
  }

  // Preference — 5
  if (profile.preference) {
    score += 5;
  }

  return Math.min(score, 100);
}
