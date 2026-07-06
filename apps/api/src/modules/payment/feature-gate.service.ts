import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';

export interface PlanFeatures {
  unlimitedInterests: boolean;
  aiRecommendations: boolean;
  advancedFilters: boolean;
  visitorInsights: boolean;
  readReceipts: boolean;
  profileBoost: number;
  priorityListing: boolean;
  prioritySupport: boolean;
  monthlyInterestQuota: number; // -1 = unlimited
}

export const FREE_FEATURES: PlanFeatures = {
  unlimitedInterests: false,
  aiRecommendations: true,
  advancedFilters: false,
  visitorInsights: false,
  readReceipts: false,
  profileBoost: 0,
  priorityListing: false,
  prioritySupport: false,
  monthlyInterestQuota: 10,
};

interface CacheEntry {
  features: PlanFeatures;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000;

/**
 * Resolves the feature entitlements for a user from their active
 * subscription's plan. Results are cached briefly in-process.
 */
@Injectable()
export class FeatureGateService {
  @Inject(DbService)
  private readonly db: DbService;

  private readonly cache = new Map<number, CacheEntry>();

  invalidate(userId: number): void {
    this.cache.delete(userId);
  }

  async getFeatures(userId: number): Promise<PlanFeatures> {
    const cached = this.cache.get(userId);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.features;
    }

    const subscription = await this.db.subscription.findFirst({
      where: { userId, status: 'ACTIVE', endsAt: { gt: new Date() } },
      include: { plan: true },
      orderBy: { endsAt: 'desc' },
    });

    const features: PlanFeatures = subscription
      ? { ...FREE_FEATURES, ...(subscription.plan.features as Partial<PlanFeatures>) }
      : { ...FREE_FEATURES };

    this.cache.set(userId, { features, expiresAt: Date.now() + CACHE_TTL_MS });

    return features;
  }

  async isPremium(userId: number): Promise<boolean> {
    const subscription = await this.db.subscription.findFirst({
      where: { userId, status: 'ACTIVE', endsAt: { gt: new Date() } },
      select: { id: true },
    });

    return !!subscription;
  }
}
