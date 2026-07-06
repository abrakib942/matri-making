import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { Inject, Injectable } from '@nestjs/common';
import { UnlockType } from '@prisma/client';

const UNLOCK_COST: Record<UnlockType, number> = {
  CONTACT: 1,
  GUARDIAN: 1,
  FULL_BIODATA: 2,
};

@Injectable()
export class UnlockService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  async unlockBiodata(userId: number, profileId: number, type: UnlockType): Promise<ServiceResult> {
    const profile = await this.db.profile.findUnique({ where: { id: profileId } });

    if (!profile || profile.status !== 'ACTIVE') {
      return createErrorResult(
        { name: 'badRequest', message: 'Profile not found' },
        'Profile not found',
      );
    }

    const ownProfile = await this.db.profileMember.findFirst({
      where: { userId, profileId, inviteStatus: 'ACCEPTED' },
    });

    if (ownProfile) {
      return createErrorResult(
        { name: 'badRequest', message: 'You already manage this profile' },
        'You already manage this profile',
      );
    }

    const existing = await this.db.biodataUnlock.findUnique({
      where: { viewerUserId_profileId_type: { viewerUserId: userId, profileId, type } },
    });

    if (existing && (!existing.expiresAt || existing.expiresAt > new Date())) {
      return createErrorResult(
        { name: 'badRequest', message: 'You have already unlocked this' },
        'You have already unlocked this',
      );
    }

    const cost = UNLOCK_COST[type];

    const result = await this.db.$transaction(async tx => {
      const wallet = await tx.creditWallet.findUnique({ where: { userId } });

      if (!wallet || wallet.balance < cost) {
        return { insufficient: true as const, balance: wallet?.balance ?? 0 };
      }

      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: cost } },
      });

      await tx.creditLedger.create({
        data: {
          walletId: wallet.id,
          type: 'SPEND_UNLOCK',
          amount: -cost,
          reference: `profile:${profileId}`,
          note: `${type} unlock for biodata ${profile.biodataNo}`,
        },
      });

      const unlock = existing
        ? await tx.biodataUnlock.update({
            where: { id: existing.id },
            data: {
              source: 'PURCHASE',
              creditsSpent: cost,
              expiresAt: null,
              createdAt: new Date(),
            },
          })
        : await tx.biodataUnlock.create({
            data: {
              viewerUserId: userId,
              profileId,
              type,
              source: 'PURCHASE',
              creditsSpent: cost,
            },
          });

      return { insufficient: false as const, unlock };
    });

    if (result.insufficient) {
      return createErrorResult(
        {
          name: 'badRequest',
          message: `Insufficient credits (balance: ${result.balance}, required: ${cost}). Purchase a credit package first.`,
        },
        'Insufficient credits',
      );
    }

    // Notify the biodata managers that someone unlocked their information.
    const members = await this.db.profileMember.findMany({
      where: { profileId, inviteStatus: 'ACCEPTED' },
      select: { userId: true },
    });

    await Promise.all(
      members.map(m =>
        this.notifications.notify(m.userId, {
          type: 'BIODATA_UNLOCKED',
          titleEn: 'Your biodata was unlocked',
          titleBn: 'আপনার বায়োডাটা আনলক হয়েছে',
          bodyEn: 'A verified member has unlocked information on your biodata.',
          bodyBn: 'একজন সদস্য আপনার বায়োডাটার তথ্য আনলক করেছেন।',
          data: { profileId, unlockType: type },
        }),
      ),
    );

    return createSuccessResult(result.unlock, 'Biodata unlocked successfully');
  }

  async listMyUnlocks(userId: number): Promise<ServiceResult> {
    const unlocks = await this.db.biodataUnlock.findMany({
      where: { viewerUserId: userId },
      include: {
        profile: {
          select: {
            id: true,
            biodataNo: true,
            mode: true,
            gender: true,
            maritalStatus: true,
            educationLevel: true,
            professionKey: true,
            districtId: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(unlocks, 'Unlocked biodatas retrieved successfully');
  }
}
