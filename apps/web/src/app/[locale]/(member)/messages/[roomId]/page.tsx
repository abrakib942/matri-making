'use client';

import { useTranslations } from 'next-intl';
import { use, useEffect, useState } from 'react';
import { ChatPanel } from '@/components/chat/chat-panel';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { chatApi } from '@/lib/api/endpoints';
import type { ChatRoomSummary } from '@/types/api';

export default function MessageRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const id = Number(roomId);
  const t = useTranslations('chat');
  const [room, setRoom] = useState<ChatRoomSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    chatApi
      .listRooms()
      .then(rooms => {
        const list = (rooms as ChatRoomSummary[]) ?? [];
        setRoom(list.find(r => r.id === id) ?? null);
      })
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (!room) return <p className="text-muted-foreground">{t('roomNotFound')}</p>;

  const readonly = room.participantRole === 'WALI' || room.participantRole === 'READONLY';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title={room.otherProfile.biodataNo} description={t('conversation')} />
      <ChatPanel
        roomId={room.id}
        expiresAt={room.expiresAt}
        waliMonitoring={room.waliMonitoring}
        readonly={readonly}
      />
    </div>
  );
}
