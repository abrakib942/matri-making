import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { HashService } from '@/util/hash.service';
import { NotificationService } from '@/util/notification.service';
import { SmsService } from '@/util/sms.service';
import { TemplateService } from '@/util/template.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { createHash, randomBytes, randomInt } from 'crypto';
import {
  ForgotPasswordDto,
  OtpPurpose,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/index';

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const REFRESH_TOKEN_TTL_DAYS = 30;
const MEMBER_ROLE_NAME = 'Member';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly hash: HashService;

  @Inject()
  private readonly jwt: JwtService;

  @Inject()
  private readonly config: ConfigService;

  @Inject()
  private readonly notificationService: NotificationService;

  @Inject()
  private readonly smsService: SmsService;

  @Inject()
  private readonly templateService: TemplateService;

  @Inject()
  private readonly verificationService: VerificationService;

  // ---------- token helpers ----------

  private signAccessToken(name: string, email: string): Promise<string> {
    return this.jwt.signAsync(
      { name, email },
      {
        issuer: this.config.get('JWT_ISSUER'),
        subject: email,
        expiresIn: '7d',
        secret: this.config.get('JWT_SECRET'),
      },
    );
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async issueTokens(user: Pick<User, 'id' | 'name' | 'email'>) {
    const accessToken = await this.signAccessToken(user.name, user.email);
    const refreshToken = randomBytes(48).toString('hex');

    await this.db.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      access_type: 'Bearer',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // ---------- OTP helpers ----------

  private generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  private async setOtp(userId: number, purpose: OtpPurpose): Promise<string> {
    const otp = this.generateOtp();

    await this.db.user.update({
      where: { id: userId },
      data: {
        otp,
        otpPurpose: purpose,
        otpAttemptCount: 0,
        otpExpiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
      },
    });

    return otp;
  }

  private async deliverOtp(user: Pick<User, 'email' | 'phone' | 'name'>, otp: string) {
    try {
      const emailHtml = this.templateService.renderTemplate('otp-code', {
        title: 'Your verification code',
        intro: `Assalamu alaikum ${user.name}, use the code below to continue. It expires in ${OTP_TTL_MINUTES} minutes.`,
        otp,
        footer: 'If you did not request this code, you can safely ignore this email.',
      });

      void this.notificationService.sendEmail({
        to: user.email,
        subject: 'Your verification code',
        html: emailHtml,
      });
    } catch (error) {
      this.logger.error('Failed to queue OTP email', error);
    }

    if (user.phone) {
      void this.smsService.sendSms({
        to: user.phone,
        message: `Your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      });
    }
  }

  private async verifyOtpForUser(
    email: string,
    otp: string,
    purpose: OtpPurpose,
  ): Promise<{ user?: User; error?: ServiceResult }> {
    const user = await this.db.user.findUnique({ where: { email } });

    if (!user || !user.otp || user.otpPurpose !== purpose) {
      return {
        error: createErrorResult(
          { name: 'badRequest', message: 'Invalid verification request' },
          'Invalid verification request',
        ),
      };
    }

    if ((user.otpAttemptCount ?? 0) >= OTP_MAX_ATTEMPTS) {
      return {
        error: createErrorResult(
          { name: 'badRequest', message: 'Too many attempts. Please request a new code.' },
          'Too many attempts',
        ),
      };
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return {
        error: createErrorResult(
          { name: 'badRequest', message: 'Code has expired. Please request a new one.' },
          'Code has expired',
        ),
      };
    }

    if (user.otp !== otp) {
      await this.db.user.update({
        where: { id: user.id },
        data: { otpAttemptCount: { increment: 1 } },
      });

      return {
        error: createErrorResult(
          { name: 'badRequest', message: 'Incorrect code' },
          'Incorrect code',
        ),
      };
    }

    return { user };
  }

  private clearOtpData() {
    return { otp: null, otpPurpose: null, otpExpiresAt: null, otpAttemptCount: 0 };
  }

  // ---------- flows ----------

  async register(dto: RegisterDto): Promise<ServiceResult> {
    const existing = await this.db.user.findUnique({ where: { email: dto.email } });

    if (existing) {
      if (existing.status === 'PENDING' && !existing.emailVerifiedAt) {
        // Re-registration of an unverified account: refresh the OTP.
        const otp = await this.setOtp(existing.id, 'REGISTRATION');
        await this.deliverOtp(existing, otp);

        return createSuccessResult(
          { email: existing.email, requiresVerification: true },
          'Account already exists but is unverified. A new verification code has been sent.',
        );
      }

      return createErrorResult(
        { name: 'badRequest', message: 'An account with this email already exists' },
        'An account with this email already exists',
      );
    }

    const memberRole = await this.db.role.upsert({
      where: { name: MEMBER_ROLE_NAME },
      update: {},
      create: { name: MEMBER_ROLE_NAME, description: 'Registered matrimony member' },
    });

    const hashedPassword = await this.hash.generateHash(dto.password);

    const user = await this.db.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        preferredLanguage: dto.preferredLanguage ?? 'en',
        status: 'PENDING',
        roles: { create: { roleId: memberRole.id } },
      },
    });

    const otp = await this.setOtp(user.id, 'REGISTRATION');
    await this.deliverOtp(user, otp);

    return createSuccessResult(
      { email: user.email, requiresVerification: true },
      'Registration successful. Please verify your account with the code sent to your email.',
    );
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<ServiceResult> {
    const { user, error } = await this.verifyOtpForUser(dto.email, dto.otp, dto.purpose);

    if (error || !user) {
      return error!;
    }

    if (dto.purpose === 'REGISTRATION') {
      const updated = await this.db.user.update({
        where: { id: user.id },
        data: {
          ...this.clearOtpData(),
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
        },
      });

      const tokens = await this.issueTokens(updated);

      await this.verificationService.syncBadges(updated.id);

      return createSuccessResult(
        {
          ...tokens,
          user: { id: updated.id, name: updated.name, email: updated.email },
        },
        'Account verified successfully. Welcome!',
      );
    }

    if (dto.purpose === 'PHONE_VERIFICATION') {
      await this.db.user.update({
        where: { id: user.id },
        data: { ...this.clearOtpData(), phoneVerifiedAt: new Date() },
      });

      await this.verificationService.syncBadges(user.id);

      return createSuccessResult({ verified: true }, 'Phone number verified successfully');
    }

    // PASSWORD_RESET verification happens in resetPassword (needs the new password).
    return createSuccessResult({ valid: true }, 'Code is valid');
  }

  async resendOtp(dto: ResendOtpDto): Promise<ServiceResult> {
    const user = await this.db.user.findUnique({ where: { email: dto.email } });

    // Do not leak account existence.
    if (!user) {
      return createSuccessResult(
        { email: dto.email },
        'If an account exists, a new code has been sent.',
      );
    }

    const otp = await this.setOtp(user.id, dto.purpose);
    await this.deliverOtp(user, otp);

    return createSuccessResult(
      { email: dto.email },
      'If an account exists, a new code has been sent.',
    );
  }

  async refresh(dto: RefreshTokenDto): Promise<ServiceResult> {
    const tokenHash = this.hashRefreshToken(dto.refreshToken);

    const stored = await this.db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return createErrorResult(
        { name: 'unauthorized', message: 'Invalid or expired refresh token' },
        'Invalid or expired refresh token',
      );
    }

    if (stored.user.status !== 'ACTIVE') {
      return createErrorResult(
        { name: 'unauthorized', message: 'Account is not active' },
        'Account is not active',
      );
    }

    // Rotate: revoke the old token, issue a fresh pair.
    await this.db.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(stored.user);

    return createSuccessResult(tokens, 'Token refreshed successfully');
  }

  async signOut(refreshToken: string): Promise<ServiceResult> {
    const tokenHash = this.hashRefreshToken(refreshToken);

    await this.db.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return createSuccessResult({ signedOut: true }, 'Signed out successfully');
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ServiceResult> {
    const user = await this.db.user.findUnique({ where: { email: dto.email } });

    if (user) {
      const otp = await this.setOtp(user.id, 'PASSWORD_RESET');
      await this.deliverOtp(user, otp);
    }

    return createSuccessResult(
      { email: dto.email },
      'If an account exists, a password reset code has been sent.',
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ServiceResult> {
    const { user, error } = await this.verifyOtpForUser(dto.email, dto.otp, 'PASSWORD_RESET');

    if (error || !user) {
      return error!;
    }

    const hashedPassword = await this.hash.generateHash(dto.newPassword);

    await this.db.$transaction([
      this.db.user.update({
        where: { id: user.id },
        data: { ...this.clearOtpData(), password: hashedPassword },
      }),
      // Revoke all sessions after a password reset.
      this.db.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return createSuccessResult(
      { email: user.email },
      'Password reset successfully. Please sign in with your new password.',
    );
  }

  async requestPhoneVerification(userId: number): Promise<ServiceResult> {
    const user = await this.db.user.findUnique({ where: { id: userId } });

    if (!user?.phone) {
      return createErrorResult(
        { name: 'badRequest', message: 'No phone number on this account' },
        'No phone number on this account',
      );
    }

    const otp = await this.setOtp(user.id, 'PHONE_VERIFICATION');
    await this.deliverOtp(user, otp);

    return createSuccessResult({ phone: user.phone }, 'Verification code sent to your phone');
  }
}
