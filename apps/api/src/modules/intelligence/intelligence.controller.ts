import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompatibilityService } from './compatibility.service';
import { InsightService } from './insight.service';
import { ReadinessService } from './readiness.service';
import { RecommendationService } from './recommendation.service';

@ApiTags('Intelligence')
@UseGuards(JwtGuard)
@Controller()
export class IntelligenceController {
  @Inject()
  private readonly compatibilityService: CompatibilityService;

  @Inject()
  private readonly insightService: InsightService;

  @Inject()
  private readonly recommendationService: RecommendationService;

  @Inject()
  private readonly readinessService: ReadinessService;

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/recommendations')
  async getRecommendations(@GetUser('id') userId: number) {
    return await this.recommendationService.getRecommendations(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/insights')
  async getMyInsights(@GetUser('id') userId: number) {
    return await this.insightService.getMyInsights(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/profiles/:id/compatibility')
  async getCompatibility(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.compatibilityService.getCompatibility(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/profiles/:id/readiness')
  async getReadiness(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.readinessService.getReadiness(userId, id);
  }
}
