import { NotificationModule } from '@/modules/notification/notification.module';
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [NotificationModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
