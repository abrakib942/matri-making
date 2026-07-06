import type { AccessGrant, ProfileDetail, ProfileModeType } from '@/types/profile';

export type SectionId =
  | 'basics'
  | 'location'
  | 'education'
  | 'family'
  | 'health'
  | 'about'
  | 'deen'
  | 'lifestyle'
  | 'guardian'
  | 'partner'
  | 'contact'
  | 'media'
  | 'privacy';

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'tags'
  | 'locationId'
  | 'income'
  | 'date'
  | 'age'
  | 'textarea';

export type AccessGate = 'manager' | 'contact' | 'guardian' | 'photo';

export interface FieldDef {
  key: string;
  type: FieldType;
  enumCategory?: string;
  accessGate?: AccessGate;
  managerOnly?: boolean;
  required?: boolean;
  modes?: ProfileModeType[];
  gender?: 'MALE' | 'FEMALE';
  getValue: (profile: ProfileDetail) => unknown;
}

export interface SectionDef {
  id: SectionId;
  modes?: ProfileModeType[];
  fields: FieldDef[];
}

function root(key: keyof ProfileDetail): FieldDef['getValue'] {
  return p => p[key];
}

function islamic(key: keyof NonNullable<ProfileDetail['islamicDetails']>): FieldDef['getValue'] {
  return p => p.islamicDetails?.[key];
}

function general(key: keyof NonNullable<ProfileDetail['generalDetails']>): FieldDef['getValue'] {
  return p => p.generalDetails?.[key];
}

function pref(key: keyof NonNullable<ProfileDetail['preference']>): FieldDef['getValue'] {
  return p => p.preference?.[key];
}

function privacy(key: keyof NonNullable<ProfileDetail['privacySettings']>): FieldDef['getValue'] {
  return p => p.privacySettings?.[key];
}

export const PROFILE_SECTIONS: SectionDef[] = [
  {
    id: 'basics',
    fields: [
      { key: 'biodataNo', type: 'text', required: true, getValue: root('biodataNo') },
      { key: 'fullName', type: 'text', managerOnly: true, getValue: root('fullName') },
      {
        key: 'gender',
        type: 'enum',
        enumCategory: 'gender',
        required: true,
        getValue: root('gender'),
      },
      { key: 'dateOfBirth', type: 'age', required: true, getValue: root('dateOfBirth') },
      {
        key: 'maritalStatus',
        type: 'enum',
        enumCategory: 'maritalStatus',
        required: true,
        getValue: root('maritalStatus'),
      },
      { key: 'childrenCount', type: 'number', getValue: root('childrenCount') },
      { key: 'heightCm', type: 'number', required: true, getValue: root('heightCm') },
      { key: 'weightKg', type: 'number', getValue: root('weightKg') },
      {
        key: 'complexion',
        type: 'enum',
        enumCategory: 'complexion',
        required: true,
        getValue: root('complexion'),
      },
      {
        key: 'bloodGroup',
        type: 'enum',
        enumCategory: 'bloodGroup',
        required: true,
        getValue: root('bloodGroup'),
      },
      {
        key: 'religion',
        type: 'enum',
        enumCategory: 'religion',
        required: true,
        getValue: root('religion'),
      },
    ],
  },
  {
    id: 'location',
    fields: [
      { key: 'countryId', type: 'locationId', required: true, getValue: root('countryId') },
      { key: 'divisionId', type: 'locationId', required: true, getValue: root('divisionId') },
      { key: 'districtId', type: 'locationId', required: true, getValue: root('districtId') },
      { key: 'upazilaId', type: 'locationId', required: true, getValue: root('upazilaId') },
      { key: 'areaName', type: 'text', required: true, getValue: root('areaName') },
      { key: 'presentAddress', type: 'textarea', getValue: root('presentAddress') },
      {
        key: 'permanentAddress',
        type: 'textarea',
        required: true,
        getValue: root('permanentAddress'),
      },
      { key: 'isExpat', type: 'boolean', getValue: root('isExpat') },
    ],
  },
  {
    id: 'education',
    fields: [
      {
        key: 'educationLevel',
        type: 'enum',
        enumCategory: 'educationLevel',
        required: true,
        getValue: root('educationLevel'),
      },
      { key: 'educationDetails', type: 'textarea', getValue: root('educationDetails') },
      {
        key: 'professionKey',
        type: 'enum',
        enumCategory: 'profession',
        required: true,
        getValue: root('professionKey'),
      },
      { key: 'professionDetails', type: 'textarea', getValue: root('professionDetails') },
      {
        key: 'monthlyIncomeBdt',
        type: 'income',
        required: true,
        getValue: root('monthlyIncomeBdt'),
      },
      { key: 'languages', type: 'tags', getValue: root('languages') },
    ],
  },
  {
    id: 'family',
    fields: [
      { key: 'fatherAlive', type: 'boolean', required: true, getValue: root('fatherAlive') },
      { key: 'fatherOccupation', type: 'text', getValue: root('fatherOccupation') },
      { key: 'motherAlive', type: 'boolean', required: true, getValue: root('motherAlive') },
      { key: 'motherOccupation', type: 'text', getValue: root('motherOccupation') },
      { key: 'brothersCount', type: 'number', required: true, getValue: root('brothersCount') },
      { key: 'sistersCount', type: 'number', required: true, getValue: root('sistersCount') },
      {
        key: 'familyStatus',
        type: 'enum',
        enumCategory: 'familyStatus',
        required: true,
        getValue: root('familyStatus'),
      },
      {
        key: 'familyValues',
        type: 'enum',
        enumCategory: 'familyValues',
        getValue: root('familyValues'),
      },
      { key: 'familyDetails', type: 'textarea', getValue: root('familyDetails') },
    ],
  },
  {
    id: 'health',
    fields: [
      {
        key: 'hasHealthIssues',
        type: 'boolean',
        required: true,
        getValue: root('hasHealthIssues'),
      },
      { key: 'healthDetails', type: 'textarea', getValue: root('healthDetails') },
    ],
  },
  {
    id: 'about',
    fields: [
      { key: 'aboutMe', type: 'textarea', required: true, getValue: root('aboutMe') },
      {
        key: 'partnerExpectation',
        type: 'textarea',
        required: true,
        getValue: root('partnerExpectation'),
      },
      { key: 'futureGoals', type: 'textarea', getValue: root('futureGoals') },
    ],
  },
  {
    id: 'deen',
    modes: ['ISLAMIC'],
    fields: [
      {
        key: 'aqidah',
        type: 'enum',
        enumCategory: 'aqidah',
        required: true,
        getValue: islamic('aqidah'),
      },
      {
        key: 'madhhab',
        type: 'enum',
        enumCategory: 'madhhab',
        required: true,
        getValue: islamic('madhhab'),
      },
      {
        key: 'prayerFrequency',
        type: 'enum',
        enumCategory: 'prayerFrequency',
        required: true,
        getValue: islamic('prayerFrequency'),
      },
      { key: 'praysInCongregation', type: 'boolean', getValue: islamic('praysInCongregation') },
      { key: 'practicingSince', type: 'text', getValue: islamic('practicingSince') },
      {
        key: 'beardStyle',
        type: 'enum',
        enumCategory: 'beardStyle',
        gender: 'MALE',
        required: true,
        getValue: islamic('beardStyle'),
      },
      {
        key: 'hijabStyle',
        type: 'enum',
        enumCategory: 'hijabStyle',
        gender: 'FEMALE',
        required: true,
        getValue: islamic('hijabStyle'),
      },
      {
        key: 'wearsAboveAnkles',
        type: 'boolean',
        gender: 'MALE',
        getValue: islamic('wearsAboveAnkles'),
      },
      {
        key: 'mahramCompliance',
        type: 'boolean',
        gender: 'FEMALE',
        getValue: islamic('mahramCompliance'),
      },
      {
        key: 'quranMemorization',
        type: 'enum',
        enumCategory: 'quranMemorization',
        getValue: islamic('quranMemorization'),
      },
      {
        key: 'quranRecitation',
        type: 'enum',
        enumCategory: 'quranRecitation',
        getValue: islamic('quranRecitation'),
      },
      { key: 'islamicEducation', type: 'textarea', getValue: islamic('islamicEducation') },
      { key: 'madrasaBackground', type: 'boolean', getValue: islamic('madrasaBackground') },
      { key: 'islamicActivities', type: 'textarea', getValue: islamic('islamicActivities') },
      { key: 'dawahInvolvement', type: 'textarea', getValue: islamic('dawahInvolvement') },
      { key: 'listensToMusic', type: 'boolean', getValue: islamic('listensToMusic') },
      { key: 'watchesDramas', type: 'boolean', getValue: islamic('watchesDramas') },
      { key: 'dressOutside', type: 'text', getValue: islamic('dressOutside') },
      { key: 'deenPracticeDetails', type: 'textarea', getValue: islamic('deenPracticeDetails') },
      {
        key: 'marriageExpectations',
        type: 'textarea',
        required: true,
        getValue: islamic('marriageExpectations'),
      },
      {
        key: 'polygynyPreference',
        type: 'enum',
        enumCategory: 'polygynyPreference',
        getValue: islamic('polygynyPreference'),
      },
      {
        key: 'viewsOnLoans',
        type: 'enum',
        enumCategory: 'viewsOnLoans',
        getValue: islamic('viewsOnLoans'),
      },
    ],
  },
  {
    id: 'lifestyle',
    modes: ['GENERAL'],
    fields: [
      {
        key: 'smoking',
        type: 'enum',
        enumCategory: 'smokingHabit',
        required: true,
        getValue: general('smoking'),
      },
      {
        key: 'drinking',
        type: 'enum',
        enumCategory: 'drinkingHabit',
        required: true,
        getValue: general('drinking'),
      },
      {
        key: 'diet',
        type: 'enum',
        enumCategory: 'dietPreference',
        required: true,
        getValue: general('diet'),
      },
      { key: 'interests', type: 'tags', getValue: general('interests') },
      { key: 'hobbies', type: 'tags', getValue: general('hobbies') },
      { key: 'personalityTraits', type: 'tags', getValue: general('personalityTraits') },
      { key: 'careerGoals', type: 'textarea', getValue: general('careerGoals') },
      { key: 'socialPreferences', type: 'textarea', getValue: general('socialPreferences') },
      { key: 'travelPreference', type: 'text', getValue: general('travelPreference') },
    ],
  },
  {
    id: 'guardian',
    modes: ['ISLAMIC'],
    fields: [
      { key: 'waliName', type: 'text', accessGate: 'guardian', getValue: islamic('waliName') },
      {
        key: 'waliRelation',
        type: 'enum',
        enumCategory: 'guardianRelation',
        accessGate: 'guardian',
        getValue: islamic('waliRelation'),
      },
      { key: 'waliPhone', type: 'text', accessGate: 'guardian', getValue: islamic('waliPhone') },
      {
        key: 'waliApproves',
        type: 'boolean',
        accessGate: 'guardian',
        getValue: islamic('waliApproves'),
      },
    ],
  },
  {
    id: 'partner',
    fields: [
      { key: 'ageMin', type: 'number', getValue: pref('ageMin') },
      { key: 'ageMax', type: 'number', getValue: pref('ageMax') },
      { key: 'heightCmMin', type: 'number', getValue: pref('heightCmMin') },
      { key: 'heightCmMax', type: 'number', getValue: pref('heightCmMax') },
      {
        key: 'maritalStatuses',
        type: 'tags',
        enumCategory: 'maritalStatus',
        getValue: pref('maritalStatuses'),
      },
      {
        key: 'educationLevels',
        type: 'tags',
        enumCategory: 'educationLevel',
        getValue: pref('educationLevels'),
      },
      {
        key: 'professionKeys',
        type: 'tags',
        enumCategory: 'profession',
        getValue: pref('professionKeys'),
      },
      { key: 'divisionIds', type: 'tags', getValue: pref('divisionIds') },
      { key: 'districtIds', type: 'tags', getValue: pref('districtIds') },
      {
        key: 'familyStatuses',
        type: 'tags',
        enumCategory: 'familyStatus',
        getValue: pref('familyStatuses'),
      },
      {
        key: 'minPrayerFrequency',
        type: 'enum',
        enumCategory: 'prayerFrequency',
        modes: ['ISLAMIC'],
        getValue: pref('minPrayerFrequency'),
      },
      {
        key: 'hijabExpectation',
        type: 'enum',
        enumCategory: 'hijabStyle',
        modes: ['ISLAMIC'],
        getValue: pref('hijabExpectation'),
      },
      {
        key: 'beardExpectation',
        type: 'enum',
        enumCategory: 'beardStyle',
        modes: ['ISLAMIC'],
        getValue: pref('beardExpectation'),
      },
      {
        key: 'quranExpectation',
        type: 'enum',
        enumCategory: 'quranMemorization',
        modes: ['ISLAMIC'],
        getValue: pref('quranExpectation'),
      },
      {
        key: 'viewsOnLoansExpect',
        type: 'enum',
        enumCategory: 'viewsOnLoans',
        modes: ['ISLAMIC'],
        getValue: pref('viewsOnLoansExpect'),
      },
      { key: 'acceptsChildren', type: 'boolean', getValue: pref('acceptsChildren') },
      { key: 'acceptsExpat', type: 'boolean', getValue: pref('acceptsExpat') },
      { key: 'languages', type: 'tags', getValue: pref('languages') },
      { key: 'otherExpectations', type: 'textarea', getValue: pref('otherExpectations') },
      { key: 'dealBreakers', type: 'tags', getValue: pref('dealBreakers') },
    ],
  },
  {
    id: 'contact',
    fields: [
      { key: 'contactPhone', type: 'text', accessGate: 'contact', getValue: root('contactPhone') },
      { key: 'contactEmail', type: 'text', accessGate: 'contact', getValue: root('contactEmail') },
    ],
  },
  {
    id: 'media',
    fields: [],
  },
  {
    id: 'privacy',
    fields: [
      {
        key: 'visibility',
        type: 'enum',
        enumCategory: 'profileVisibility',
        getValue: privacy('visibility'),
      },
      {
        key: 'photoPolicy',
        type: 'enum',
        enumCategory: 'photoPolicy',
        getValue: privacy('photoPolicy'),
      },
      {
        key: 'contactPolicy',
        type: 'enum',
        enumCategory: 'contactPolicy',
        getValue: privacy('contactPolicy'),
      },
      { key: 'hidePhone', type: 'boolean', getValue: privacy('hidePhone') },
      { key: 'hideLocation', type: 'boolean', getValue: privacy('hideLocation') },
    ],
  },
];

export function getVisibleSections(profile: ProfileDetail, options?: { includePrivacy?: boolean }) {
  return PROFILE_SECTIONS.filter(section => {
    if (section.id === 'privacy' && !options?.includePrivacy) return false;
    if (section.id === 'media') return true;
    if (section.modes && !section.modes.includes(profile.mode)) return false;
    return true;
  });
}

export function isFieldLocked(
  field: FieldDef,
  access?: AccessGrant,
  isPreviewAsOwner?: boolean,
): boolean {
  if (field.managerOnly && !access?.isManager) return true;
  if (field.accessGate === 'contact' && !access?.canViewContact && !access?.isManager) return true;
  if (field.accessGate === 'guardian' && !access?.canViewGuardian && !access?.isManager)
    return true;
  if (isPreviewAsOwner && field.accessGate) return true;
  return false;
}

export function isFieldVisible(field: FieldDef, profile: ProfileDetail): boolean {
  if (field.modes && !field.modes.includes(profile.mode)) return false;
  if (field.gender && profile.gender !== field.gender) return false;
  return true;
}

export function shouldShowFieldInView(
  field: FieldDef,
  raw: unknown,
  locked: boolean,
  showRequired: boolean,
): boolean {
  if (locked) return true;
  if (hasFieldValue(raw) || field.key === 'biodataNo') return true;
  return showRequired && !!field.required;
}

export function hasFieldValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function calcAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}
