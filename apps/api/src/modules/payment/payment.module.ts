import { NotificationModule } from '@/modules/notification/notification.module';
import { Module } from '@nestjs/common';
import { FeatureGateService } from './feature-gate.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SslCommerzService } from './sslcommerz.service';
import { UnlockService } from './unlock.service';

@Module({
  imports: [NotificationModule],
  controllers: [PaymentController],
  providers: [PaymentService, SslCommerzService, UnlockService, FeatureGateService],
  exports: [FeatureGateService, UnlockService],
})
export class PaymentModule {}
