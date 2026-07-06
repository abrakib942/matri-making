import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subject?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  action?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
