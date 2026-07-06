'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { ChatRoomSummary } from '@/types/api';

interface Props {
  rooms: ChatRoomSummary[];
}

export function ChatRoomList({ rooms }: Props) {
  const t = useTranslations('chat');

  if (!rooms.length) {
    return <p className="text-sm text-muted-foreground">{t('noRooms')}</p>;
  }

  return (
    <ul className="space-y-3">
      {rooms.map(room => (
        <li key={room.id}>
          <Link
            href={`/messages/${room.id}`}
            className="block rounded-xl border border-border p-4 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{room.otherProfile.biodataNo}</p>
              {room.waliMonitoring && (
                <span className="text-[10px] uppercase tracking-wide text-primary">
                  {t('monitored')}
                </span>
              )}
            </div>
            {room.lastMessage && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {room.lastMessage.body}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
