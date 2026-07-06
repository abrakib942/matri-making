import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import Bull from 'bull';
import * as MailerService from './mailer.service';

@Injectable()
export class NotificationService {
  constructor(@InjectQueue('notification-queue') private queue: Queue) {}

  sendEmail(
    payload: MailerService.IMailerPayload,
  ): Promise<Bull.Job<MailerService.IMailerPayload>> {
    return this.queue.add('mail-send', payload);
  }
}
