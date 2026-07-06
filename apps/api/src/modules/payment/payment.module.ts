import { ChatModule } from '@/modules/chat/chat.module';
import { MutualMatchModule } from '@/modules/interest/mutual-match.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { Module } from '@nestjs/common';
import { FeatureGateService } from './feature-gate.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SslCommerzService } from './sslcommerz.service';
import { UnlockService } from './unlock.service';

@Module({
  imports: [NotificationModule, ChatModule, MutualMatchModule, ProfileModule],
  controllers: [PaymentController],
  providers: [PaymentService, SslCommerzService, UnlockService, FeatureGateService],
  exports: [FeatureGateService, UnlockService],
})
export class PaymentModule {}
