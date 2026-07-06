import { NotificationModule } from '@/modules/notification/notification.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { Module } from '@nestjs/common';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';

@Module({
  imports: [ProfileModule, NotificationModule],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
