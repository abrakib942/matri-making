import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignOutDto,
  VerifyOtpDto,
} from './dto/index';

@ApiTags('Auth')
@Controller()
export class AuthController {
  @Inject()
  private readonly authService: AuthService;

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.authService.verifyOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return await this.authService.resendOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.authService.refresh(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/sign-out')
  async signOut(@Body() dto: SignOutDto) {
    return await this.authService.signOut(dto.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/auth/request-phone-verification')
  async requestPhoneVerification(@GetUser('id') userId: number) {
    return await this.authService.requestPhoneVerification(userId);
  }
}
