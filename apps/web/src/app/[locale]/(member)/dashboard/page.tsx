'use client';

import { Heart, Inbox, Search, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { BiodataCard } from '@/components/profile/biodata-card';
import { ReadinessMeter } from '@/components/profile/readiness-meter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { dashboardApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType, MutualMatchItem } from '@/types/api';

interface DashboardResponse {
  hasProfile?: boolean;
  profile?: {
    id: number;
    biodataNo: string;
    mode: string;
    status: string;
    completionPercent: number;
    readinessPercent?: number;
  };
  stats?: {
    visitorCount: number;
    interestsReceivedPending: number;
    interestsSentPending: number;
    unreadNotifications: number;
    shortlistCount: number;
  };
  recommendedMatches?: BiodataCardType[];
  mutualMatches?: { count: number; items: MutualMatchItem[] };
  unreadNotifications?: number;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const mutual = useTranslations('mutualMatch');
  const nav = useTranslations('nav');
  const c = useTranslations('common');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(d => setData(d as DashboardResponse))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.hasProfile) {
    return (
      <div className="text-center py-16 space-y-4">
        <PageHeader title={t('title')} />
        <p className="text-muted-foreground">{t('noProfile')}</p>
        <Button asChild>
          <Link href="/onboarding">{c('getStarted')}</Link>
        </Button>
      </div>
    );
  }

  const profile = data.profile!;
  const stats = data.stats;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('title')}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href="/search">
                <Search className="h-4 w-4" />
                {c('search')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href="/interests">
                <Heart className="h-4 w-4" />
                {nav('interests')}
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/premium">
                <Sparkles className="h-4 w-4" />
                {c('premium')}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Inbox}
          label={t('interestsReceived')}
          value={stats?.interestsReceivedPending ?? 0}
        />
        <StatCard
          icon={Heart}
          label={t('interestsSent')}
          value={stats?.interestsSentPending ?? 0}
        />
        <StatCard icon={Users} label={t('visitors')} value={stats?.visitorCount ?? 0} />
        <StatCard
          icon={TrendingUp}
          label={nav('notifications')}
          value={stats?.unreadNotifications ?? data.unreadNotifications ?? 0}
        />
      </div>

      {(data.mutualMatches?.count ?? 0) > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{mutual('title')}</p>
                <p className="text-sm text-muted-foreground">{mutual('subtitle')}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/profiles/${data.mutualMatches?.items[0]?.profileId ?? ''}`}>
                {mutual('cta')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100" aria-hidden>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - profile.completionPercent / 100)}
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {profile.completionPercent}%
              </span>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <p className="font-semibold">{t('completion')}</p>
              <p className="text-sm text-muted-foreground">{profile.biodataNo}</p>
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link href="/my-profile">{nav('myProfile')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <ReadinessMeter percent={profile.readinessPercent ?? 0} variant="ring" />
          </CardContent>
        </Card>
      </div>

      {(data.recommendedMatches?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('recommendations')}</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/recommendations">{c('viewAll')}</Link>
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
            {data.recommendedMatches!.map(p => (
              <div key={p.id} className="w-64 shrink-0 snap-start">
                <BiodataCard profile={p} showCompatibility />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
