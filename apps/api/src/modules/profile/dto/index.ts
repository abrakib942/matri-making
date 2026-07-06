import {
  Aqidah,
  BeardStyle,
  BloodGroup,
  Complexion,
  ContactPolicy,
  DietPreference,
  DrinkingHabit,
  EducationLevel,
  FamilyStatus,
  FamilyValues,
  Gender,
  GuardianRelation,
  HijabStyle,
  Madhhab,
  MaritalStatus,
  MediaType,
  MemberRelationship,
  MemberRole,
  PhotoPolicy,
  PolygynyPreference,
  PrayerFrequency,
  ProfileMode,
  ProfileVisibility,
  QuranMemorization,
  QuranRecitation,
  Religion,
  SmokingHabit,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProfileDto {
  @IsEnum(ProfileMode)
  mode!: ProfileMode;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(MemberRelationship)
  relationship!: MemberRelationship;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsEnum(Religion)
  @IsOptional()
  religion?: Religion;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  fullName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsInt()
  @Min(90)
  @Max(250)
  @IsOptional()
  heightCm?: number;

  @IsInt()
  @Min(25)
  @Max(300)
  @IsOptional()
  weightKg?: number;

  @IsEnum(Complexion)
  @IsOptional()
  complexion?: Complexion;

  @IsEnum(BloodGroup)
  @IsOptional()
  bloodGroup?: BloodGroup;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  childrenCount?: number;

  @IsEnum(Religion)
  @IsOptional()
  religion?: Religion;

  @IsInt()
  @IsOptional()
  countryId?: number;

  @IsInt()
  @IsOptional()
  divisionId?: number;

  @IsInt()
  @IsOptional()
  districtId?: number;

  @IsInt()
  @IsOptional()
  upazilaId?: number;

  @IsString()
  @IsOptional()
  presentAddress?: string;

  @IsString()
  @IsOptional()
  permanentAddress?: string;

  @IsBoolean()
  @IsOptional()
  isExpat?: boolean;

  @IsEnum(EducationLevel)
  @IsOptional()
  educationLevel?: EducationLevel;

  @IsString()
  @IsOptional()
  educationDetails?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  professionKey?: string;

  @IsString()
  @IsOptional()
  professionDetails?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  monthlyIncomeBdt?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsBoolean()
  @IsOptional()
  fatherAlive?: boolean;

  @IsString()
  @IsOptional()
  fatherOccupation?: string;

  @IsBoolean()
  @IsOptional()
  motherAlive?: boolean;

  @IsString()
  @IsOptional()
  motherOccupation?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  brothersCount?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  sistersCount?: number;

  @IsEnum(FamilyStatus)
  @IsOptional()
  familyStatus?: FamilyStatus;

  @IsEnum(FamilyValues)
  @IsOptional()
  familyValues?: FamilyValues;

  @IsString()
  @IsOptional()
  familyDetails?: string;

  @IsBoolean()
  @IsOptional()
  hasHealthIssues?: boolean;

  @IsString()
  @IsOptional()
  healthDetails?: string;

  @IsString()
  @IsOptional()
  aboutMe?: string;

  @IsString()
  @IsOptional()
  partnerExpectation?: string;

  @IsString()
  @IsOptional()
  futureGoals?: string;

  @IsString()
  @IsOptional()
  @MaxLength(17)
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;
}

export class UpdateIslamicDetailsDto {
  @IsEnum(Aqidah)
  @IsOptional()
  aqidah?: Aqidah;

  @IsEnum(Madhhab)
  @IsOptional()
  madhhab?: Madhhab;

  @IsEnum(PrayerFrequency)
  @IsOptional()
  prayerFrequency?: PrayerFrequency;

  @IsBoolean()
  @IsOptional()
  praysInCongregation?: boolean;

  @IsString()
  @IsOptional()
  practicingSince?: string;

  @IsEnum(BeardStyle)
  @IsOptional()
  beardStyle?: BeardStyle;

  @IsBoolean()
  @IsOptional()
  wearsAboveAnkles?: boolean;

  @IsEnum(HijabStyle)
  @IsOptional()
  hijabStyle?: HijabStyle;

  @IsBoolean()
  @IsOptional()
  mahramCompliance?: boolean;

  @IsEnum(QuranMemorization)
  @IsOptional()
  quranMemorization?: QuranMemorization;

  @IsEnum(QuranRecitation)
  @IsOptional()
  quranRecitation?: QuranRecitation;

  @IsString()
  @IsOptional()
  islamicEducation?: string;

  @IsBoolean()
  @IsOptional()
  madrasaBackground?: boolean;

  @IsString()
  @IsOptional()
  islamicActivities?: string;

  @IsString()
  @IsOptional()
  dawahInvolvement?: string;

  @IsBoolean()
  @IsOptional()
  listensToMusic?: boolean;

  @IsBoolean()
  @IsOptional()
  watchesDramas?: boolean;

  @IsString()
  @IsOptional()
  dressOutside?: string;

  @IsString()
  @IsOptional()
  deenPracticeDetails?: string;

  @IsString()
  @IsOptional()
  marriageExpectations?: string;

  @IsEnum(PolygynyPreference)
  @IsOptional()
  polygynyPreference?: PolygynyPreference;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  waliName?: string;

  @IsEnum(GuardianRelation)
  @IsOptional()
  waliRelation?: GuardianRelation;

  @IsString()
  @IsOptional()
  @MaxLength(17)
  waliPhone?: string;

  @IsBoolean()
  @IsOptional()
  waliApproves?: boolean;
}

export class UpdateGeneralDetailsDto {
  @IsEnum(SmokingHabit)
  @IsOptional()
  smoking?: SmokingHabit;

  @IsEnum(DrinkingHabit)
  @IsOptional()
  drinking?: DrinkingHabit;

  @IsEnum(DietPreference)
  @IsOptional()
  diet?: DietPreference;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hobbies?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  personalityTraits?: string[];

  @IsString()
  @IsOptional()
  careerGoals?: string;

  @IsString()
  @IsOptional()
  socialPreferences?: string;

  @IsString()
  @IsOptional()
  travelPreference?: string;

  @IsBoolean()
  @IsOptional()
  galleryEnabled?: boolean;
}

export class UpdatePreferenceDto {
  @IsInt()
  @Min(18)
  @Max(100)
  @IsOptional()
  ageMin?: number;

  @IsInt()
  @Min(18)
  @Max(100)
  @IsOptional()
  ageMax?: number;

  @IsInt()
  @IsOptional()
  heightCmMin?: number;

  @IsInt()
  @IsOptional()
  heightCmMax?: number;

  @IsArray()
  @IsEnum(MaritalStatus, { each: true })
  @IsOptional()
  maritalStatuses?: MaritalStatus[];

  @IsArray()
  @IsEnum(EducationLevel, { each: true })
  @IsOptional()
  educationLevels?: EducationLevel[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  professionKeys?: string[];

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsOptional()
  districtIds?: number[];

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsOptional()
  divisionIds?: number[];

  @IsArray()
  @IsEnum(FamilyStatus, { each: true })
  @IsOptional()
  familyStatuses?: FamilyStatus[];

  @IsEnum(PrayerFrequency)
  @IsOptional()
  minPrayerFrequency?: PrayerFrequency;

  @IsEnum(HijabStyle)
  @IsOptional()
  hijabExpectation?: HijabStyle;

  @IsEnum(BeardStyle)
  @IsOptional()
  beardExpectation?: BeardStyle;

  @IsEnum(QuranMemorization)
  @IsOptional()
  quranExpectation?: QuranMemorization;

  @IsBoolean()
  @IsOptional()
  acceptsChildren?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptsExpat?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsString()
  @IsOptional()
  otherExpectations?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dealBreakers?: string[];
}

export class UpdatePrivacyDto {
  @IsEnum(ProfileVisibility)
  @IsOptional()
  visibility?: ProfileVisibility;

  @IsEnum(PhotoPolicy)
  @IsOptional()
  photoPolicy?: PhotoPolicy;

  @IsEnum(ContactPolicy)
  @IsOptional()
  contactPolicy?: ContactPolicy;

  @IsBoolean()
  @IsOptional()
  hidePhone?: boolean;

  @IsBoolean()
  @IsOptional()
  hideLocation?: boolean;
}

export class AddMediaDto {
  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;

  @IsUrl({ require_tld: false })
  url!: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  blurredUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateMediaDto {
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsEnum(MemberRelationship)
  relationship!: MemberRelationship;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;
}

export class RespondInviteDto {
  @IsIn(['ACCEPTED', 'DECLINED'])
  response!: 'ACCEPTED' | 'DECLINED';
}
