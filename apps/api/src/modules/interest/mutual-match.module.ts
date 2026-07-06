import { DbModule } from '@/db/db.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { Module } from '@nestjs/common';
import { MutualMatchService } from './mutual-match.service';

@Module({
  imports: [DbModule, NotificationModule],
  providers: [MutualMatchService],
  exports: [MutualMatchService],
})
export class MutualMatchModule {}
