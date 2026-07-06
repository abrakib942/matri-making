import { ProfileMode, ProfileStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AdminListProfilesDto {
  @IsEnum(ProfileStatus)
  @IsOptional()
  status?: ProfileStatus;

  @IsEnum(ProfileMode)
  @IsOptional()
  mode?: ProfileMode;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  search?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  cursor?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class RejectProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}
