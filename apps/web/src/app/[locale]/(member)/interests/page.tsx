'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { BiodataCard } from '@/components/profile/biodata-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { interestApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';

interface InterestItem {
  id: number;
  status: string;
  message?: string;
  fromProfile?: BiodataCardType;
  toProfile?: BiodataCardType;
  profile?: BiodataCardType;
}

type Tab = 'sent' | 'received';

export default function InterestsPage() {
  const nav = useTranslations('nav');
  const c = useTranslations('common');
  const [tab, setTab] = useState<Tab>('received');
  const [items, setItems] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    interestApi
      .list(tab === 'sent' ? 'SENT' : 'RECEIVED')
      .then((data: unknown) => {
        const list = Array.isArray(data)
          ? data
          : ((data as { items?: InterestItem[] })?.items ?? []);
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [tab]);

  const respond = async (id: number, action: 'ACCEPT' | 'REJECT') => {
    setActing(id);
    try {
      await interestApi.respond(id, action);
      load();
    } finally {
      setActing(null);
    }
  };

  const profileOf = (item: InterestItem) =>
    tab === 'sent' ? (item.toProfile ?? item.profile) : (item.fromProfile ?? item.profile);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{nav('interests')}</h1>

      <div className="flex gap-2 border-b">
        {(['received', 'sent'] as Tab[]).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            {key === 'received' ? 'Received' : 'Sent'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No interests yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const profile = profileOf(item);
            return (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    {profile ? (
                      <div className="flex-1 max-w-xs">
                        <BiodataCard profile={profile} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Profile unavailable</p>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm">
                        Status: <span className="font-medium">{item.status}</span>
                      </p>
                      {item.message && (
                        <p className="text-sm text-muted-foreground">{item.message}</p>
                      )}
                      {tab === 'received' && item.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={acting === item.id}
                            onClick={() => respond(item.id, 'ACCEPT')}
                          >
                            {acting === item.id ? c('loading') : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={acting === item.id}
                            onClick={() => respond(item.id, 'REJECT')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
