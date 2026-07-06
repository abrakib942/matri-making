import { VerificationType } from '@prisma/client';
import { IsArray, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitVerificationDto {
  @IsEnum(VerificationType)
  type!: VerificationType;

  @IsArray()
  @IsString({ each: true })
  evidenceUrls!: string[];

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  note?: string;
}

export class ReviewVerificationDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewNote?: string;
}
