'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { BiodataCard } from '@/components/profile/biodata-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { interestApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';

export default function ShortlistPage() {
  const t = useTranslations('member');
  const c = useTranslations('common');
  const [items, setItems] = useState<BiodataCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    interestApi
      .listShortlist()
      .then((data: unknown) => {
        const list = Array.isArray(data)
          ? data
          : ((data as { items?: BiodataCardType[] })?.items ?? []);
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (profileId: number) => {
    setRemoving(profileId);
    try {
      await interestApi.removeShortlist(profileId);
      load();
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('shortlist')}</h1>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Your shortlist is empty.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <div key={p.id} className="space-y-2">
              <BiodataCard profile={p} />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={removing === p.id}
                onClick={() => remove(p.id)}
              >
                {removing === p.id ? c('loading') : 'Remove'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
