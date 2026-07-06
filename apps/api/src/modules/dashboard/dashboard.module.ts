import { IntelligenceModule } from '@/modules/intelligence/intelligence.module';
import { MutualMatchModule } from '@/modules/interest/mutual-match.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [ProfileModule, IntelligenceModule, MutualMatchModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
