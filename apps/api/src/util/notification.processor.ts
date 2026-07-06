import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import bull from 'bull';
import * as _ from 'lodash';
import { IMailerPayload, MailerService } from './mailer.service';

@Processor('notification-queue')
export class NotificationProcessor {
  @Inject()
  private readonly mailer: MailerService;

  @Process('mail-send')
  async sendMail(job: bull.Job<IMailerPayload>) {
    console.debug('processor: notification-queue -> process: mail-send -> starts', {
      ..._.pick(job, ['opts', 'name', 'data', 'id']),
    });

    const result = await this.mailer.sendMail(job.data);

    console.debug('processor: notification-queue -> process: mail-send -> ends', { result });
  }
}
