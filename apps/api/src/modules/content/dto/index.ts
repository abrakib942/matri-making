import { GeneralStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

// ---------- success stories ----------

export class CreateSuccessStoryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  profileId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titleEn!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  titleBn?: string;

  @IsString()
  @IsNotEmpty()
  contentEn!: string;

  @IsString()
  @IsOptional()
  contentBn?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  imageUrl?: string;

  @IsDateString()
  @IsOptional()
  marriedAt?: string;

  @IsEnum(GeneralStatus)
  @IsOptional()
  status?: GeneralStatus;
}

export class UpdateSuccessStoryDto extends CreateSuccessStoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  declare titleEn: string;

  @IsString()
  @IsOptional()
  declare contentEn: string;
}

// ---------- CMS pages ----------

export class CreateCmsPageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titleEn!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  titleBn?: string;

  @IsString()
  @IsNotEmpty()
  contentEn!: string;

  @IsString()
  @IsOptional()
  contentBn?: string;

  @IsEnum(GeneralStatus)
  @IsOptional()
  status?: GeneralStatus;
}

export class UpdateCmsPageDto extends CreateCmsPageDto {
  @IsString()
  @IsOptional()
  declare slug: string;

  @IsString()
  @IsOptional()
  declare titleEn: string;

  @IsString()
  @IsOptional()
  declare contentEn: string;
}

// ---------- advertisements ----------

export class CreateAdvertisementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsUrl({ require_tld: false })
  imageUrl!: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  targetUrl?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  placement!: string;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsEnum(GeneralStatus)
  @IsOptional()
  status?: GeneralStatus;
}

export class UpdateAdvertisementDto extends CreateAdvertisementDto {
  @IsString()
  @IsOptional()
  declare title: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  declare imageUrl: string;

  @IsString()
  @IsOptional()
  declare placement: string;
}
