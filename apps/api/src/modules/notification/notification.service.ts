import { createSuccessResult, ServiceResult } from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { NotificationService as EmailQueueService } from '@/util/notification.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

export interface NotifyPayload {
  type: NotificationType;
  titleEn: string;
  titleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  data?: Prisma.InputJsonValue;
  email?: { subject: string; html: string };
}

@Injectable()
export class InAppNotificationService {
  private readonly logger = new Logger(InAppNotificationService.name);

  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly emailQueue: EmailQueueService;

  async notify(userId: number, payload: NotifyPayload): Promise<void> {
    await this.db.notification.create({
      data: {
        userId,
        type: payload.type,
        titleEn: payload.titleEn,
        titleBn: payload.titleBn,
        bodyEn: payload.bodyEn,
        bodyBn: payload.bodyBn,
        data: payload.data ?? {},
      },
    });

    if (payload.email) {
      try {
        const user = await this.db.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        if (user) {
          void this.emailQueue.sendEmail({
            to: user.email,
            subject: payload.email.subject,
            html: payload.email.html,
          });
        }
      } catch (error) {
        this.logger.error('Failed to queue notification email', error);
      }
    }
  }

  async list(userId: number, cursor?: number, limit = 20): Promise<ServiceResult> {
    const notifications = await this.db.notification.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;

    return createSuccessResult(
      {
        items,
        nextCursor: hasMore ? items[items.length - 1].id : null,
      },
      'Notifications retrieved successfully',
    );
  }

  async unreadCount(userId: number): Promise<ServiceResult> {
    const count = await this.db.notification.count({ where: { userId, readAt: null } });

    return createSuccessResult({ count }, 'Unread count retrieved successfully');
  }

  async markRead(userId: number, id: number): Promise<ServiceResult> {
    await this.db.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });

    return createSuccessResult({ read: true }, 'Notification marked as read');
  }

  async markAllRead(userId: number): Promise<ServiceResult> {
    await this.db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return createSuccessResult({ read: true }, 'All notifications marked as read');
  }
}
