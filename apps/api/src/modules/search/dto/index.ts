import {
  Aqidah,
  BeardStyle,
  EducationLevel,
  FamilyStatus,
  Gender,
  HijabStyle,
  Madhhab,
  MaritalStatus,
  PrayerFrequency,
  ProfileMode,
  QuranMemorization,
  Religion,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchProfilesDto {
  @IsEnum(ProfileMode)
  @IsOptional()
  mode?: ProfileMode;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  biodataNo?: string;

  @IsEnum(Religion)
  @IsOptional()
  religion?: Religion;

  @IsInt()
  @Min(18)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  ageMin?: number;

  @IsInt()
  @Min(18)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  ageMax?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  heightCmMin?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  heightCmMax?: number;

  @IsArray()
  @IsEnum(MaritalStatus, { each: true })
  @IsOptional()
  maritalStatuses?: MaritalStatus[];

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
  @IsInt({ each: true })
  @Type(() => Number)
  @IsOptional()
  upazilaIds?: number[];

  @IsBoolean()
  @IsOptional()
  isExpat?: boolean;

  @IsArray()
  @IsEnum(EducationLevel, { each: true })
  @IsOptional()
  educationLevels?: EducationLevel[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  professionKeys?: string[];

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  incomeMin?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  incomeMax?: number;

  @IsBoolean()
  @IsOptional()
  withoutChildren?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsArray()
  @IsEnum(FamilyStatus, { each: true })
  @IsOptional()
  familyStatuses?: FamilyStatus[];

  // Islamic filters
  @IsEnum(PrayerFrequency)
  @IsOptional()
  minPrayerFrequency?: PrayerFrequency;

  @IsArray()
  @IsEnum(HijabStyle, { each: true })
  @IsOptional()
  hijabStyles?: HijabStyle[];

  @IsArray()
  @IsEnum(BeardStyle, { each: true })
  @IsOptional()
  beardStyles?: BeardStyle[];

  @IsArray()
  @IsEnum(QuranMemorization, { each: true })
  @IsOptional()
  quranMemorization?: QuranMemorization[];

  @IsArray()
  @IsEnum(Madhhab, { each: true })
  @IsOptional()
  madhhabs?: Madhhab[];

  @IsArray()
  @IsEnum(Aqidah, { each: true })
  @IsOptional()
  aqidahs?: Aqidah[];

  // Membership filters
  @IsBoolean()
  @IsOptional()
  verifiedOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  premiumOnly?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  recentlyActiveDays?: number;

  // Pagination & sorting
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  cursor?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsIn(['newest', 'lastActive'])
  @IsOptional()
  sortBy?: 'newest' | 'lastActive';

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  minMatchScore?: number;
}
