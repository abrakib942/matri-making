import { ProfileModule } from '@/modules/profile/profile.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CompatibilityService } from './compatibility.service';
import { InsightService } from './insight.service';
import { IntelligenceController } from './intelligence.controller';
import { INTELLIGENCE_QUEUE, IntelligenceProcessor } from './intelligence.processor';
import { ReadinessService } from './readiness.service';
import { RecommendationService } from './recommendation.service';

@Module({
  imports: [ProfileModule, BullModule.registerQueue({ name: INTELLIGENCE_QUEUE })],
  controllers: [IntelligenceController],
  providers: [
    CompatibilityService,
    InsightService,
    RecommendationService,
    ReadinessService,
    IntelligenceProcessor,
  ],
  exports: [CompatibilityService, InsightService, RecommendationService, ReadinessService],
})
export class IntelligenceModule {}
