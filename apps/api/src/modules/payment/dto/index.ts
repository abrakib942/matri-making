import { OrderType, UnlockType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsEnum(OrderType)
  type!: OrderType;

  /** Plan key (e.g. "premium-monthly") or credit package key (e.g. "credits-5"). */
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  itemKey!: string;
}

export class UnlockBiodataDto {
  @IsEnum(UnlockType)
  type!: UnlockType;
}
