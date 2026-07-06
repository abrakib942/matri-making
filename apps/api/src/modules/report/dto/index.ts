import { ReportStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  reason!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  details?: string;
}

export class ResolveReportDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  resolutionNote?: string;
}
