import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SignInUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  roleIds: number[];

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @Length(10, 17)
  @IsOptional()
  nid?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class UserCreateDto extends OmitType(UserDto, ['status']) {}

export class UserUpdateDto extends PartialType(OmitType(UserDto, ['password'])) {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  roleIds?: number[];
}

export class AssignUserRolesDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  roleIds: number[];
}

export class AssignUserPermissionsDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  permissionIds: number[];
}
