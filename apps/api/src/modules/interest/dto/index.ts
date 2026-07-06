import { InterestStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SendInterestDto {
  @IsInt()
  toProfileId!: number;

  @IsInt()
  @IsOptional()
  fromProfileId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}

export class RespondInterestDto {
  @IsIn(['ACCEPTED', 'REJECTED'])
  response!: 'ACCEPTED' | 'REJECTED';
}

export class ListInterestsDto {
  @IsIn(['sent', 'received'])
  direction!: 'sent' | 'received';

  @IsEnum(InterestStatus)
  @IsOptional()
  status?: InterestStatus;

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
}

export class BlockProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

export class NoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  note!: string;
}
