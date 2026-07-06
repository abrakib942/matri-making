'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { BiodataCard } from '@/components/profile/biodata-card';
import { Skeleton } from '@/components/ui/skeleton';
import { intelligenceApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';

export default function RecommendationsPage() {
  const nav = useTranslations('nav');
  const [items, setItems] = useState<BiodataCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intelligenceApi
      .recommendations()
      .then((data: unknown) => {
        const list = Array.isArray(data)
          ? data
          : ((data as { items?: BiodataCardType[] })?.items ?? []);
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{nav('recommendations')}</h1>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No recommendations yet. Complete your profile for better matches.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <BiodataCard key={p.id} profile={p} showCompatibility />
          ))}
        </div>
      )}
    </div>
  );
}
