'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BiodataCard } from '@/components/profile/biodata-card';
import { BiodataCardSkeleton } from '@/components/profile/biodata-card-skeleton';
import { searchApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function CuratedMatches() {
  const t = useTranslations('home');
  const c = useTranslations('common');
  const [profiles, setProfiles] = useState<BiodataCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchApi
      .search({ limit: 3, sortBy: 'lastActive' })
      .then(res => setProfiles((res.items ?? []).slice(0, 3) as BiodataCardType[]))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <p className="text-label mb-3">{t('curatedEyebrow')}</p>
          <h2 className="text-h2 mb-4">{t('curatedTitle')}</h2>
          <p className="text-body">{t('curatedDesc')}</p>
        </div>

        <div className="space-y-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <BiodataCardSkeleton key={i} variant="horizontal" />)
            : profiles.length > 0
              ? profiles.map(p => <BiodataCard key={p.id} profile={p} variant="horizontal" />)
              : (
                <div className="glass-panel p-12 text-center text-muted-foreground">
                  {t('curatedEmpty')}
                </div>
              )}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/register">{c('getStarted')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
