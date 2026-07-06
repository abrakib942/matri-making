import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export const OTP_PURPOSES = ['REGISTRATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION'] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @IsOptional()
  @MaxLength(17)
  phone?: string;

  @IsIn(['en', 'bn'])
  @IsOptional()
  preferredLanguage?: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsIn(OTP_PURPOSES)
  purpose!: OtpPurpose;
}

export class ResendOtpDto {
  @IsEmail()
  email!: string;

  @IsIn(OTP_PURPOSES)
  purpose!: OtpPurpose;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class SignOutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}
