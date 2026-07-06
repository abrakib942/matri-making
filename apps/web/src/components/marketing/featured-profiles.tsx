'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BiodataCard } from '@/components/profile/biodata-card';
import { searchApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function FeaturedProfiles() {
  const t = useTranslations('home');
  const c = useTranslations('common');
  const [profiles, setProfiles] = useState<BiodataCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchApi
      .search({ limit: 4, sortBy: 'lastActive' })
      .then(res => setProfiles((res.items ?? []) as BiodataCardType[]))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container py-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">{t('featuredTitle')}</h2>
        <Button asChild variant="outline">
          <Link href="/register">{c('getStarted')}</Link>
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))
          : profiles.map(p => <BiodataCard key={p.id} profile={p} />)}
      </div>
    </section>
  );
}
