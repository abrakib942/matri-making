import { NotificationModule } from '@/modules/notification/notification.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { Module } from '@nestjs/common';
import { InterestController } from './interest.controller';
import { InterestService } from './interest.service';
import { MutualMatchModule } from './mutual-match.module';

@Module({
  imports: [ProfileModule, NotificationModule, PaymentModule, MutualMatchModule],
  controllers: [InterestController],
  providers: [InterestService],
  exports: [InterestService],
})
export class InterestModule {}
