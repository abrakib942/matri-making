import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdminListProfilesDto, RejectProfileDto } from './dto/index';

@Injectable()
export class AdminService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  private async notifyProfileManagers(
    profileId: number,
    payload: Parameters<InAppNotificationService['notify']>[1],
  ): Promise<void> {
    const members = await this.db.profileMember.findMany({
      where: { profileId, inviteStatus: 'ACCEPTED' },
      select: { userId: true },
    });

    await Promise.all(members.map(m => this.notifications.notify(m.userId, payload)));
  }

  // ---------- profile moderation ----------

  async listProfiles(dto: AdminListProfilesDto): Promise<ServiceResult> {
    const limit = dto.limit ?? 20;

    const where: Prisma.ProfileWhereInput = {
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.mode ? { mode: dto.mode } : {}),
      ...(dto.search
        ? {
            OR: [
              { biodataNo: { contains: dto.search, mode: 'insensitive' } },
              { fullName: { contains: dto.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const profiles = await this.db.profile.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { sentInterests: true, receivedInterests: true, reportsAgainst: true } },
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
    });

    const hasMore = profiles.length > limit;
    const items = hasMore ? profiles.slice(0, limit) : profiles;

    return createSuccessResult(
      { items, nextCursor: hasMore ? items[items.length - 1].id : null },
      'Profiles retrieved successfully',
    );
  }

  async getProfile(id: number): Promise<ServiceResult> {
    const profile = await this.db.profile.findUnique({
      where: { id },
      include: {
        islamicDetails: true,
        generalDetails: true,
        preference: true,
        privacySettings: true,
        media: true,
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        reportsAgainst: { where: { status: { in: ['OPEN', 'IN_REVIEW'] } } },
      },
    });

    if (!profile) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    return createSuccessResult(profile, 'Profile retrieved successfully');
  }

  async approveProfile(id: number): Promise<ServiceResult> {
    const profile = await this.db.profile.findUnique({ where: { id } });

    if (!profile) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    if (profile.status !== 'PENDING_APPROVAL') {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile is not awaiting approval' },
        'Profile is not awaiting approval',
      );
    }

    const data = await this.db.profile.update({
      where: { id },
      data: { status: 'ACTIVE', approvedAt: new Date(), rejectionReason: null },
    });

    await this.notifyProfileManagers(id, {
      type: 'PROFILE_APPROVED',
      titleEn: 'Your biodata has been approved',
      titleBn: 'আপনার বায়োডাটা অনুমোদিত হয়েছে',
      bodyEn: `Biodata ${profile.biodataNo} is now live and visible in search.`,
      bodyBn: `বায়োডাটা ${profile.biodataNo} এখন সার্চে দৃশ্যমান।`,
      data: { profileId: id },
    });

    return createSuccessResult(data, 'Profile approved');
  }

  async rejectProfile(id: number, dto: RejectProfileDto): Promise<ServiceResult> {
    const profile = await this.db.profile.findUnique({ where: { id } });

    if (!profile || profile.status !== 'PENDING_APPROVAL') {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile is not awaiting approval' },
        'Profile is not awaiting approval',
      );
    }

    const data = await this.db.profile.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: dto.reason },
    });

    await this.notifyProfileManagers(id, {
      type: 'PROFILE_REJECTED',
      titleEn: 'Your biodata needs changes',
      titleBn: 'আপনার বায়োডাটায় পরিবর্তন প্রয়োজন',
      bodyEn: dto.reason,
      data: { profileId: id },
    });

    return createSuccessResult(data, 'Profile rejected');
  }

  async blockProfile(id: number): Promise<ServiceResult> {
    const profile = await this.db.profile.findUnique({ where: { id } });

    if (!profile) {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    const data = await this.db.profile.update({
      where: { id },
      data: { status: 'BLOCKED' },
    });

    return createSuccessResult(data, 'Profile blocked');
  }

  async unblockProfile(id: number): Promise<ServiceResult> {
    const profile = await this.db.profile.findUnique({ where: { id } });

    if (!profile || profile.status !== 'BLOCKED') {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile is not blocked' },
        'Profile is not blocked',
      );
    }

    const data = await this.db.profile.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    return createSuccessResult(data, 'Profile unblocked');
  }

  // ---------- payments audit ----------

  async listOrders(cursor?: number, limit = 50): Promise<ServiceResult> {
    const orders = await this.db.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        payments: true,
        invoice: true,
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = orders.length > limit;
    const items = hasMore ? orders.slice(0, limit) : orders;

    return createSuccessResult(
      { items, nextCursor: hasMore ? items[items.length - 1].id : null },
      'Orders retrieved successfully',
    );
  }

  async listSubscriptions(): Promise<ServiceResult> {
    const subscriptions = await this.db.subscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { key: true, nameEn: true, pricePaisa: true } },
      },
      orderBy: { id: 'desc' },
      take: 100,
    });

    return createSuccessResult(subscriptions, 'Subscriptions retrieved successfully');
  }

  async listUnlocks(): Promise<ServiceResult> {
    const unlocks = await this.db.biodataUnlock.findMany({
      include: {
        viewer: { select: { id: true, name: true, email: true } },
        profile: { select: { id: true, biodataNo: true } },
      },
      orderBy: { id: 'desc' },
      take: 100,
    });

    return createSuccessResult(unlocks, 'Unlocks retrieved successfully');
  }

  // ---------- analytics ----------

  async getAnalytics(): Promise<ServiceResult> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers30d,
      totalProfiles,
      islamicProfiles,
      generalProfiles,
      maleProfiles,
      femaleProfiles,
      pendingApproval,
      pendingVerifications,
      openReports,
      openTickets,
      totalInterests,
      acceptedInterests,
      marriedJourneys,
      revenue,
      activeSubscriptions,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.profile.count(),
      this.db.profile.count({ where: { mode: 'ISLAMIC' } }),
      this.db.profile.count({ where: { mode: 'GENERAL' } }),
      this.db.profile.count({ where: { gender: 'MALE', status: 'ACTIVE' } }),
      this.db.profile.count({ where: { gender: 'FEMALE', status: 'ACTIVE' } }),
      this.db.profile.count({ where: { status: 'PENDING_APPROVAL' } }),
      this.db.verificationRequest.count({ where: { status: 'PENDING' } }),
      this.db.report.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
      this.db.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.db.interest.count(),
      this.db.interest.count({ where: { status: 'ACCEPTED' } }),
      this.db.matchJourney.count({ where: { stage: 'MARRIED' } }),
      this.db.order.aggregate({ where: { status: 'PAID' }, _sum: { amountPaisa: true } }),
      this.db.subscription.count({ where: { status: 'ACTIVE', endsAt: { gt: new Date() } } }),
    ]);

    return createSuccessResult(
      {
        users: { total: totalUsers, newLast30Days: newUsers30d },
        profiles: {
          total: totalProfiles,
          islamic: islamicProfiles,
          general: generalProfiles,
          activeMale: maleProfiles,
          activeFemale: femaleProfiles,
          pendingApproval,
        },
        moderation: { pendingVerifications, openReports, openTickets },
        funnel: {
          interestsSent: totalInterests,
          interestsAccepted: acceptedInterests,
          marriages: marriedJourneys,
        },
        revenue: {
          totalPaisa: revenue._sum.amountPaisa ?? 0,
          activeSubscriptions,
        },
      },
      'Analytics retrieved successfully',
    );
  }
}
