import { TicketPriority, TicketStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;
}

export class TicketMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;
}
