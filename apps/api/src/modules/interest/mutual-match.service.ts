import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class MutualMatchService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  canonicalPair(a: number, b: number): [number, number] {
    return a < b ? [a, b] : [b, a];
  }

  async findForPair(profileAId: number, profileBId: number) {
    const [low, high] = this.canonicalPair(profileAId, profileBId);
    return this.db.mutualMatch.findUnique({
      where: { profileLowId_profileHighId: { profileLowId: low, profileHighId: high } },
    });
  }

  /** Called after shortlisting — detects reciprocal shortlist and notifies once. */
  async detectAfterShortlist(ownerProfileId: number, targetProfileId: number): Promise<void> {
    const reciprocal = await this.db.shortlist.findUnique({
      where: {
        ownerProfileId_targetProfileId: {
          ownerProfileId: targetProfileId,
          targetProfileId: ownerProfileId,
        },
      },
    });

    if (!reciprocal) return;

    const [low, high] = this.canonicalPair(ownerProfileId, targetProfileId);

    const existing = await this.db.mutualMatch.findUnique({
      where: { profileLowId_profileHighId: { profileLowId: low, profileHighId: high } },
    });

    if (existing) return;

    const match = await this.db.mutualMatch.create({
      data: { profileLowId: low, profileHighId: high, notifiedAt: new Date() },
    });

    const profiles = await this.db.profile.findMany({
      where: { id: { in: [low, high] } },
      select: {
        id: true,
        biodataNo: true,
        members: { where: { inviteStatus: 'ACCEPTED', role: 'OWNER' }, select: { userId: true } },
      },
    });

    for (const profile of profiles) {
      const other = profiles.find(p => p.id !== profile.id);
      for (const member of profile.members) {
        await this.notifications.notify(member.userId, {
          type: 'MUTUAL_MATCH',
          titleEn: 'You have a mutual match!',
          titleBn: 'আপনার পারস্পরিক ম্যাচ হয়েছে!',
          bodyEn: `You and ${other?.biodataNo ?? 'another member'} shortlisted each other. Unlock for 50% fewer credits.`,
          bodyBn: `আপনি এবং ${other?.biodataNo ?? 'অন্য সদস্য'} একে অপরকে শর্টলিস্ট করেছেন। ৫০% কম ক্রেডিটে আনলক করুন।`,
          data: { mutualMatchId: match.id, profileId: other?.id },
        });
      }
    }
  }

  async listForProfile(profileId: number) {
    const matches = await this.db.mutualMatch.findMany({
      where: { OR: [{ profileLowId: profileId }, { profileHighId: profileId }] },
      include: {
        profileLow: { select: { id: true, biodataNo: true, mode: true, gender: true } },
        profileHigh: { select: { id: true, biodataNo: true, mode: true, gender: true } },
      },
      orderBy: { detectedAt: 'desc' },
    });

    return matches.map(m => {
      const isLow = m.profileLowId === profileId;
      const other = isLow ? m.profileHigh : m.profileLow;
      const discountUsed = isLow ? m.discountUsedByLow : m.discountUsedByHigh;
      return {
        mutualMatchId: m.id,
        profileId: other.id,
        biodataNo: other.biodataNo,
        mode: other.mode,
        gender: other.gender,
        detectedAt: m.detectedAt,
        discountAvailable: !discountUsed,
      };
    });
  }

  async checkDiscountEligibility(
    viewerProfileId: number,
    targetProfileId: number,
  ): Promise<{ eligible: boolean; mutualMatchId?: number; isLow?: boolean }> {
    const match = await this.findForPair(viewerProfileId, targetProfileId);
    if (!match) return { eligible: false };

    const isLow = match.profileLowId === viewerProfileId;
    const alreadyUsed = isLow ? match.discountUsedByLow : match.discountUsedByHigh;
    if (alreadyUsed) return { eligible: false, mutualMatchId: match.id, isLow };

    return { eligible: true, mutualMatchId: match.id, isLow };
  }

  async commitDiscount(
    mutualMatchId: number,
    isLow: boolean,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.db;
    await client.mutualMatch.update({
      where: { id: mutualMatchId },
      data: isLow ? { discountUsedByLow: true } : { discountUsedByHigh: true },
    });
  }
}
