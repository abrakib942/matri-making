import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { ProfileAccessService } from '@/modules/profile/profile-access.service';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ChatParticipantRole, ProfileMode } from '@prisma/client';

const CHAT_DAYS_ISLAMIC = 14;

@Injectable()
export class ChatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatService.name);
  private expiryTimer?: ReturnType<typeof setInterval>;

  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly access: ProfileAccessService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  onModuleInit() {
    this.expiryTimer = setInterval(() => void this.expireRooms(), 60_000);
  }

  onModuleDestroy() {
    if (this.expiryTimer) clearInterval(this.expiryTimer);
  }

  async expireRooms() {
    const now = new Date();
    const expired = await this.db.chatRoom.updateMany({
      where: { status: 'ACTIVE', expiresAt: { lte: now } },
      data: { status: 'EXPIRED' },
    });
    if (expired.count > 0) {
      this.logger.log(`Expired ${expired.count} chat room(s)`);
    }
  }

  private pairKey(a: number, b: number): [number, number] {
    return a < b ? [a, b] : [b, a];
  }

  async findActiveRoomBetween(profileAId: number, profileBId: number) {
    const [low, high] = this.pairKey(profileAId, profileBId);
    return this.db.chatRoom.findFirst({
      where: {
        profileAId: low,
        profileBId: high,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: { participants: true },
    });
  }

  async createRoomForUnlock(params: {
    viewerUserId: number;
    viewerProfileId: number;
    targetProfileId: number;
    unlockId: number;
    targetMode: ProfileMode;
  }) {
    const { viewerProfileId, targetProfileId, unlockId, targetMode } = params;
    const [low, high] = this.pairKey(viewerProfileId, targetProfileId);

    const existing = await this.findActiveRoomBetween(viewerProfileId, targetProfileId);
    if (existing) return existing;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CHAT_DAYS_ISLAMIC);

    const targetMembers = await this.db.profileMember.findMany({
      where: { profileId: targetProfileId, inviteStatus: 'ACCEPTED', role: 'OWNER' },
      select: { userId: true },
    });
    const viewerMembers = await this.db.profileMember.findMany({
      where: { profileId: viewerProfileId, inviteStatus: 'ACCEPTED', role: 'OWNER' },
      select: { userId: true },
    });

    const room = await this.db.chatRoom.create({
      data: {
        profileAId: low,
        profileBId: high,
        mode: targetMode,
        unlockId,
        expiresAt,
        status: 'ACTIVE',
        participants: {
          create: [
            ...viewerMembers.map(m => ({
              userId: m.userId,
              profileId: viewerProfileId,
              role: 'MEMBER' as ChatParticipantRole,
            })),
            ...targetMembers.map(m => ({
              userId: m.userId,
              profileId: targetProfileId,
              role: 'MEMBER' as ChatParticipantRole,
            })),
          ],
        },
      },
      include: { participants: true },
    });

    if (targetMode === 'ISLAMIC') {
      await this.addWaliParticipants(room.id, viewerProfileId, targetProfileId);
    }

    return this.db.chatRoom.findUnique({
      where: { id: room.id },
      include: { participants: true },
    });
  }

  private async addWaliParticipants(roomId: number, profileAId: number, profileBId: number) {
    for (const profileId of [profileAId, profileBId]) {
      const guardian = await this.db.profileMember.findFirst({
        where: { profileId, relationship: 'GUARDIAN', inviteStatus: 'ACCEPTED' },
        select: { userId: true },
      });

      if (guardian) {
        await this.db.chatParticipant.upsert({
          where: { roomId_userId: { roomId, userId: guardian.userId } },
          update: { role: 'WALI' },
          create: {
            roomId,
            userId: guardian.userId,
            profileId,
            role: 'WALI',
          },
        });
        continue;
      }

      const islamic = await this.db.islamicProfileDetails.findUnique({
        where: { profileId },
        select: { waliPhone: true },
      });

      if (islamic?.waliPhone) {
        const waliUser = await this.db.user.findFirst({
          where: { phone: islamic.waliPhone },
          select: { id: true },
        });
        if (waliUser) {
          await this.db.chatParticipant.upsert({
            where: { roomId_userId: { roomId, userId: waliUser.id } },
            update: { role: 'READONLY' },
            create: {
              roomId,
              userId: waliUser.id,
              profileId,
              role: 'READONLY',
            },
          });
        }
      }
    }
  }

  async listRoomsForUser(userId: number) {
    const participations = await this.db.chatParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            profileA: {
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
            profileB: {
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
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const viewerProfileId = await this.access.getPrimaryProfileId(userId);

    return participations.map(p => {
      const room = p.room;
      const other =
        room.profileAId === viewerProfileId || p.profileId === room.profileAId
          ? room.profileB
          : room.profileA;
      const waliMonitoring = room.mode === 'ISLAMIC' && p.role === 'MEMBER';

      return {
        id: room.id,
        expiresAt: room.expiresAt,
        status: room.status,
        waliMonitoring,
        participantRole: p.role,
        lastMessage: room.messages[0] ?? null,
        otherProfile: other,
      };
    });
  }

  async getRoomHistory(userId: number, roomId: number, cursor?: number) {
    const participant = await this.db.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!participant) return null;

    const messages = await this.db.chatMessage.findMany({
      where: { roomId },
      orderBy: { id: 'desc' },
      take: 51,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        senderProfile: { select: { id: true, biodataNo: true, fullName: true } },
      },
    });

    const hasMore = messages.length > 50;
    const items = hasMore ? messages.slice(0, 50) : messages;

    return {
      messages: items.reverse(),
      nextCursor: hasMore ? items[0]?.id : null,
      participantRole: participant.role,
    };
  }

  async sendMessage(userId: number, roomId: number, body: string) {
    const participant = await this.db.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
      include: { room: true },
    });

    if (!participant || participant.role === 'READONLY' || participant.role === 'WALI') {
      return { error: 'FORBIDDEN' as const };
    }

    if (participant.room.status !== 'ACTIVE' || participant.room.expiresAt <= new Date()) {
      return { error: 'EXPIRED' as const };
    }

    if (!participant.profileId) {
      return { error: 'NO_PROFILE' as const };
    }

    const message = await this.db.chatMessage.create({
      data: {
        roomId,
        senderProfileId: participant.profileId,
        body: body.trim(),
      },
      include: {
        senderProfile: { select: { id: true, biodataNo: true, fullName: true } },
      },
    });

    const waliParticipants = await this.db.chatParticipant.findMany({
      where: { roomId, role: { in: ['WALI', 'READONLY'] } },
      select: { userId: true },
    });

    await Promise.all(
      waliParticipants.map(w =>
        this.notifications.notify(w.userId, {
          type: 'CHAT_MESSAGE',
          titleEn: 'New message in monitored chat',
          titleBn: 'নিরীক্ষিত চ্যাটে নতুন বার্তা',
          bodyEn: body.slice(0, 120),
          bodyBn: body.slice(0, 120),
          data: { roomId, messageId: message.id },
        }),
      ),
    );

    return { message, participantRole: participant.role };
  }

  async isParticipant(userId: number, roomId: number) {
    return this.db.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
  }
}
