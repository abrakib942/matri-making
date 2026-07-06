'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ChatRoomList } from '@/components/chat/chat-room-list';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { chatApi } from '@/lib/api/endpoints';
import type { ChatRoomSummary } from '@/types/api';

export default function MessagesPage() {
  const t = useTranslations('chat');
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatApi
      .listRooms()
      .then(data => setRooms((data as ChatRoomSummary[]) ?? []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title={t('title')} description={t('desc')} />
      <ChatRoomList rooms={rooms} />
    </div>
  );
}
