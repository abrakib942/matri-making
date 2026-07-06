import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
// services
import { UtilityService } from './utility.service';
import { ErrorService } from './error.service';
import { HashService } from './hash.service';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { MailerService } from './mailer.service';
import { SmsService } from './sms.service';
import { TemplateService } from './template.service';

const modules = [
  UtilityService,
  ErrorService,
  HashService,
  NotificationService,
  NotificationProcessor,
  MailerService,
  SmsService,
  TemplateService,
];

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
  ],
  providers: [...modules],
  exports: [...modules],
})
export class UtilityModule {}
