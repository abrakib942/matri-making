import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { ChatService } from '@/modules/chat/chat.service';
import { MutualMatchService } from '@/modules/interest/mutual-match.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
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

  @Inject()
  private readonly mutualMatch: MutualMatchService;

  @Inject()
  private readonly chat: ChatService;

  @Inject()
  private readonly access: ProfileAccessService;

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

    const viewerProfileId = await this.access.getPrimaryProfileId(userId);
    let baseCost = UNLOCK_COST[type];
    let discountApplied = false;
    let mutualMatchId: number | undefined;

    if (viewerProfileId) {
      const discount = await this.mutualMatch.applyDiscountIfEligible(viewerProfileId, profileId);
      if (discount.applied) {
        discountApplied = true;
        mutualMatchId = discount.mutualMatchId;
        baseCost = Math.max(1, Math.ceil(baseCost * 0.5));
      }
    }

    const cost = baseCost;

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
          note: `${type} unlock for biodata ${profile.biodataNo}${discountApplied ? ' (mutual match 50%)' : ''}`,
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

    let chatRoom = null;

    if (type === 'CONTACT' && viewerProfileId) {
      chatRoom = await this.chat.createRoomForUnlock({
        viewerUserId: userId,
        viewerProfileId,
        targetProfileId: profileId,
        unlockId: result.unlock.id,
        targetMode: profile.mode,
      });
    }

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

    return createSuccessResult(
      {
        ...result.unlock,
        creditsCharged: cost,
        discountApplied,
        mutualMatchId,
        chatRoom: chatRoom
          ? {
              id: chatRoom.id,
              expiresAt: chatRoom.expiresAt,
              waliMonitoring: profile.mode === 'ISLAMIC',
            }
          : null,
        contactRevealed: type === 'CONTACT' && profile.mode === 'GENERAL',
      },
      profile.mode === 'ISLAMIC' && type === 'CONTACT'
        ? 'Safe chat opened for 14 days'
        : 'Biodata unlocked successfully',
    );
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
