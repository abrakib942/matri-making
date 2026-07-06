import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { Inject, Injectable } from '@nestjs/common';
import { VerificationStatus, VerificationType } from '@prisma/client';
import { ReviewVerificationDto, SubmitVerificationDto } from './dto/index';

const REVIEWED_TYPES: VerificationType[] = ['NID', 'FACE', 'SCHOLAR', 'GUARDIAN'];

@Injectable()
export class VerificationService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  /**
   * Recomputes the denormalized badge list on every profile the user manages.
   * EMAIL/PHONE come from the user record; the rest from approved requests.
   */
  async syncBadges(userId: number): Promise<void> {
    const [user, approved, memberships] = await Promise.all([
      this.db.user.findUnique({
        where: { id: userId },
        select: { emailVerifiedAt: true, phoneVerifiedAt: true },
      }),
      this.db.verificationRequest.findMany({
        where: { userId, status: 'APPROVED' },
        select: { type: true },
      }),
      this.db.profileMember.findMany({
        where: { userId, inviteStatus: 'ACCEPTED' },
        select: { profileId: true },
      }),
    ]);

    const badges = new Set<string>();
    if (user?.emailVerifiedAt) badges.add('EMAIL');
    if (user?.phoneVerifiedAt) badges.add('PHONE');
    for (const request of approved) badges.add(request.type);

    if (memberships.length) {
      await this.db.profile.updateMany({
        where: { id: { in: memberships.map(m => m.profileId) } },
        data: { verificationBadges: Array.from(badges) },
      });
    }
  }

  async submit(userId: number, dto: SubmitVerificationDto): Promise<ServiceResult> {
    if (!REVIEWED_TYPES.includes(dto.type)) {
      return createErrorResult(
        {
          name: 'badRequest',
          message: 'Email and phone are verified automatically via OTP, not through this flow',
        },
        'Use the OTP flow for email/phone verification',
      );
    }

    if (!dto.evidenceUrls.length) {
      return createErrorResult(
        { name: 'badRequest', message: 'At least one evidence document is required' },
        'At least one evidence document is required',
      );
    }

    const pending = await this.db.verificationRequest.findFirst({
      where: { userId, type: dto.type, status: 'PENDING' },
    });

    if (pending) {
      return createErrorResult(
        { name: 'badRequest', message: 'A request of this type is already under review' },
        'A request of this type is already under review',
      );
    }

    const approved = await this.db.verificationRequest.findFirst({
      where: { userId, type: dto.type, status: 'APPROVED' },
    });

    if (approved) {
      return createErrorResult(
        { name: 'badRequest', message: 'This verification is already approved' },
        'This verification is already approved',
      );
    }

    const data = await this.db.verificationRequest.create({
      data: {
        userId,
        type: dto.type,
        evidenceUrls: dto.evidenceUrls,
        note: dto.note,
      },
    });

    return createSuccessResult(data, 'Verification request submitted for review');
  }

  async getMine(userId: number): Promise<ServiceResult> {
    const [requests, user] = await Promise.all([
      this.db.verificationRequest.findMany({
        where: { userId },
        orderBy: { id: 'desc' },
      }),
      this.db.user.findUnique({
        where: { id: userId },
        select: { emailVerifiedAt: true, phoneVerifiedAt: true },
      }),
    ]);

    const badges: string[] = [];
    if (user?.emailVerifiedAt) badges.push('EMAIL');
    if (user?.phoneVerifiedAt) badges.push('PHONE');
    badges.push(...requests.filter(r => r.status === 'APPROVED').map(r => r.type as string));

    return createSuccessResult({ badges, requests }, 'Verifications retrieved successfully');
  }

  // ---------- admin review ----------

  async listForReview(
    status?: VerificationStatus,
    type?: VerificationType,
  ): Promise<ServiceResult> {
    const requests = await this.db.verificationRequest.findMany({
      where: {
        status: status ?? 'PENDING',
        ...(type ? { type } : {}),
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { id: 'asc' },
    });

    return createSuccessResult(requests, 'Verification requests retrieved successfully');
  }

  async review(
    reviewerId: number,
    requestId: number,
    dto: ReviewVerificationDto,
  ): Promise<ServiceResult> {
    const request = await this.db.verificationRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      return createErrorResult(
        { name: 'badRequest', message: 'Verification request not found' },
        'Verification request not found',
      );
    }

    if (request.status !== 'PENDING') {
      return createErrorResult(
        { name: 'badRequest', message: 'This request has already been reviewed' },
        'This request has already been reviewed',
      );
    }

    const data = await this.db.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        reviewerId,
        reviewedAt: new Date(),
        reviewNote: dto.reviewNote,
      },
    });

    if (dto.status === 'APPROVED') {
      await this.syncBadges(request.userId);
    }

    await this.notifications.notify(request.userId, {
      type: 'VERIFICATION_RESULT',
      titleEn: `Your ${request.type} verification was ${dto.status.toLowerCase()}`,
      titleBn:
        dto.status === 'APPROVED'
          ? 'আপনার ভেরিফিকেশন অনুমোদিত হয়েছে'
          : 'আপনার ভেরিফিকেশন প্রত্যাখ্যাত হয়েছে',
      bodyEn: dto.reviewNote ?? undefined,
      data: { requestId, type: request.type, status: dto.status },
    });

    return createSuccessResult(data, `Verification ${dto.status.toLowerCase()}`);
  }
}
