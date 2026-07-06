import { Module } from '@nestjs/common';
import { InAppNotificationController } from './notification.controller';
import { InAppNotificationService } from './notification.service';

@Module({
  controllers: [InAppNotificationController],
  providers: [InAppNotificationService],
  exports: [InAppNotificationService],
})
export class NotificationModule {}
