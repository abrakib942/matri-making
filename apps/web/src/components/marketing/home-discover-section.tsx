'use client';

import { Search, UserRound, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { HeroSearch } from '@/components/marketing/hero-search';
import { Skeleton } from '@/components/ui/skeleton';
import { metaApi } from '@/lib/api/endpoints';
import { formatBnNumber } from '@/lib/format-bn-number';
import type { PublicStats } from '@/types/api';

function CountCell({
  label,
  male,
  female,
  locale,
  loading,
}: {
  label: string;
  male: number;
  female: number;
  locale: string;
  loading: boolean;
}) {
  const t = useTranslations('home');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-secondary/40 p-4 space-y-3">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5" aria-hidden />
      <p className="text-sm font-semibold relative">{label}</p>
      <div className="grid grid-cols-2 gap-3 relative">
        <div className="text-center space-y-1 rounded-xl bg-background/60 py-2">
          {loading ? (
            <Skeleton className="h-7 w-12 mx-auto" />
          ) : (
            <p className="text-2xl font-bold text-primary tabular-nums">
              {formatBnNumber(male, locale)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('statsGrooms')}</p>
        </div>
        <div className="text-center space-y-1 rounded-xl bg-background/60 py-2">
          {loading ? (
            <Skeleton className="h-7 w-12 mx-auto" />
          ) : (
            <p className="text-2xl font-bold text-accent tabular-nums">
              {formatBnNumber(female, locale)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('statsBrides')}</p>
        </div>
      </div>
    </div>
  );
}

export function HomeDiscoverSection() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi
      .getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const islamic = stats?.byMode?.ISLAMIC;
  const general = stats?.byMode?.GENERAL;

  return (
    <section className="relative border-y overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]" />
      <div className="container relative py-12 md:py-16 space-y-10">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <p className="text-label">{t('discoverEyebrow')}</p>
          <h2 className="text-h2 font-bengali">{t('discoverTitle')}</h2>
          <p className="text-muted-foreground">{t('discoverDesc')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {loading ? (
                <Skeleton className="inline-block h-4 w-32" />
              ) : (
                <>
                  {t('statsTotal')}:{' '}
                  <strong className="text-foreground">
                    {formatBnNumber(stats?.totalBiodatas ?? 0, locale)}
                  </strong>
                </>
              )}
            </span>
          </div>

          <CountCell
            label={t('statsIslamic')}
            male={islamic?.male ?? 0}
            female={islamic?.female ?? 0}
            locale={locale}
            loading={loading}
          />
          <CountCell
            label={t('statsGeneral')}
            male={general?.male ?? 0}
            female={general?.female ?? 0}
            locale={locale}
            loading={loading}
          />

          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-primary/5 p-4 flex flex-col justify-center gap-1 sm:col-span-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <UserRound className="h-4 w-4 text-primary" />
              {t('statsAllGrooms')}
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-primary tabular-nums">
                {formatBnNumber(stats?.grooms ?? 0, locale)}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pt-3">
              <UserRound className="h-4 w-4 text-accent" />
              {t('statsAllBrides')}
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-accent tabular-nums">
                {formatBnNumber(stats?.brides ?? 0, locale)}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass-panel overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <Search className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t('searchFormTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('searchFormSubtitle')}</p>
              </div>
            </div>
            <div className="p-5 md:p-7">
              <HeroSearch />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
