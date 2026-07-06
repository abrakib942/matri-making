'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { BiodataCard } from '@/components/profile/biodata-card';
import { Skeleton } from '@/components/ui/skeleton';
import { interestApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';

export default function FavouritesPage() {
  const t = useTranslations('member');
  const [items, setItems] = useState<BiodataCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interestApi
      .listFavourites()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { items?: BiodataCardType[] })?.items ?? [];
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('favourites')}</h1>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No favourites yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <BiodataCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}
