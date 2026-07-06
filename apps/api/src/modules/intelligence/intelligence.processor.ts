import { DbService } from '@/db/db.service';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bull';
import { InsightService } from './insight.service';
import { ReadinessService } from './readiness.service';

export const INTELLIGENCE_QUEUE = 'intelligence-queue';

/**
 * Nightly refresh of owner-only insights and readiness meters for profiles
 * active in the last 30 days. Match scores are recomputed lazily on access.
 */
@Injectable()
@Processor(INTELLIGENCE_QUEUE)
export class IntelligenceProcessor implements OnModuleInit {
  private readonly logger = new Logger(IntelligenceProcessor.name);

  constructor(@InjectQueue(INTELLIGENCE_QUEUE) private readonly queue: Queue) {}

  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly insightService: InsightService;

  @Inject()
  private readonly readinessService: ReadinessService;

  async onModuleInit() {
    try {
      await this.queue.add(
        'nightly-refresh',
        {},
        { repeat: { cron: '0 3 * * *' }, removeOnComplete: true, removeOnFail: true },
      );
    } catch (error) {
      this.logger.warn(`Could not schedule nightly intelligence job: ${String(error)}`);
    }
  }

  @Process('nightly-refresh')
  async handleNightlyRefresh() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const profiles = await this.db.profile.findMany({
      where: { status: 'ACTIVE', lastActiveAt: { gte: cutoff } },
      select: { id: true },
    });

    this.logger.log(`Nightly intelligence refresh for ${profiles.length} active profiles`);

    for (const profile of profiles) {
      try {
        await this.insightService.computeForProfile(profile.id);
        await this.readinessService.computeForProfile(profile.id);
      } catch (error) {
        this.logger.error(`Failed refreshing profile ${profile.id}`, error);
      }
    }
  }
}
