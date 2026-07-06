import { JourneyStage } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateJourneyStageDto {
  @IsEnum(JourneyStage)
  stage!: JourneyStage;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  note?: string;
}
