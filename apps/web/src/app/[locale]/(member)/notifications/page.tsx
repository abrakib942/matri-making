'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationApi } from '@/lib/api/endpoints';

interface Notification {
  id: number;
  title: string;
  body?: string;
  readAt?: string | null;
  createdAt?: string;
}

export default function NotificationsPage() {
  const nav = useTranslations('nav');
  const c = useTranslations('common');
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationApi
      .list()
      .then((data: unknown) => {
        const list = Array.isArray(data)
          ? data
          : ((data as { items?: Notification[] })?.items ?? []);
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    await notificationApi.markRead(id);
    load();
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{nav('notifications')}</h1>
        {items.some(n => !n.readAt) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No notifications.</p>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <Card key={n.id} className={!n.readAt ? 'border-primary/30 bg-primary/5' : ''}>
              <CardContent className="pt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                </div>
                {!n.readAt && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                    {c('save')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
