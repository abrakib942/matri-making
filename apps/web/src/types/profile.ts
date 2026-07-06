import type { ProfileModeType } from './api';

export type { ProfileModeType };

export interface AccessGrant {
  isManager?: boolean;
  canViewContact?: boolean;
  canViewGuardian?: boolean;
  canViewPhoto?: boolean;
  photoBlurredOnly?: boolean;
  canAccessSafeChat?: boolean;
  activeChatRoomId?: number | null;
}

export interface ProfileMedia {
  id: number;
  type: string;
  url: string | null;
  blurredUrl?: string | null;
  isPrimary?: boolean;
}

export interface IslamicDetails {
  aqidah?: string | null;
  madhhab?: string | null;
  prayerFrequency?: string | null;
  praysInCongregation?: boolean | null;
  practicingSince?: string | null;
  beardStyle?: string | null;
  wearsAboveAnkles?: boolean | null;
  hijabStyle?: string | null;
  mahramCompliance?: boolean | null;
  quranMemorization?: string | null;
  quranRecitation?: string | null;
  islamicEducation?: string | null;
  madrasaBackground?: boolean | null;
  islamicActivities?: string | null;
  dawahInvolvement?: string | null;
  listensToMusic?: boolean | null;
  watchesDramas?: boolean | null;
  dressOutside?: string | null;
  deenPracticeDetails?: string | null;
  marriageExpectations?: string | null;
  polygynyPreference?: string | null;
  viewsOnLoans?: string | null;
  waliName?: string | null;
  waliRelation?: string | null;
  waliPhone?: string | null;
  waliApproves?: boolean | null;
}

export interface GeneralDetails {
  smoking?: string | null;
  drinking?: string | null;
  diet?: string | null;
  interests?: string[];
  hobbies?: string[];
  personalityTraits?: string[];
  careerGoals?: string | null;
  socialPreferences?: string | null;
  travelPreference?: string | null;
  galleryEnabled?: boolean | null;
}

export interface PartnerPreference {
  ageMin?: number | null;
  ageMax?: number | null;
  heightCmMin?: number | null;
  heightCmMax?: number | null;
  maritalStatuses?: string[];
  educationLevels?: string[];
  professionKeys?: string[];
  districtIds?: number[];
  divisionIds?: number[];
  familyStatuses?: string[];
  minPrayerFrequency?: string | null;
  hijabExpectation?: string | null;
  beardExpectation?: string | null;
  quranExpectation?: string | null;
  viewsOnLoansExpect?: string | null;
  acceptsChildren?: boolean | null;
  acceptsExpat?: boolean | null;
  languages?: string[];
  otherExpectations?: string | null;
  dealBreakers?: string[];
}

export interface PrivacySettings {
  visibility?: string;
  photoPolicy?: string;
  contactPolicy?: string;
  hidePhone?: boolean;
  hideLocation?: boolean;
}

export interface ProfileDetail {
  id: number;
  biodataNo: string;
  mode: ProfileModeType;
  status?: string;
  fullName?: string;
  gender: string;
  dateOfBirth?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  complexion?: string | null;
  bloodGroup?: string | null;
  maritalStatus?: string;
  childrenCount?: number | null;
  religion?: string | null;
  countryId?: number | null;
  divisionId?: number | null;
  districtId?: number | null;
  upazilaId?: number | null;
  areaName?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  isExpat?: boolean;
  educationLevel?: string | null;
  educationDetails?: string | null;
  professionKey?: string | null;
  professionDetails?: string | null;
  monthlyIncomeBdt?: number | null;
  languages?: string[];
  fatherAlive?: boolean | null;
  fatherOccupation?: string | null;
  motherAlive?: boolean | null;
  motherOccupation?: string | null;
  brothersCount?: number | null;
  sistersCount?: number | null;
  familyStatus?: string | null;
  familyValues?: string | null;
  familyDetails?: string | null;
  hasHealthIssues?: boolean | null;
  healthDetails?: string | null;
  aboutMe?: string | null;
  partnerExpectation?: string | null;
  futureGoals?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  greenFlags?: string[];
  verificationBadges?: string[];
  isPremium?: boolean;
  completionPercent?: number;
  islamicDetails?: IslamicDetails | null;
  generalDetails?: GeneralDetails | null;
  preference?: PartnerPreference | null;
  privacySettings?: PrivacySettings | null;
  media?: ProfileMedia[];
  access?: AccessGrant;
}

export interface ProfileMembership {
  relationship: string;
  role: string;
  profile: ProfileDetail;
}
