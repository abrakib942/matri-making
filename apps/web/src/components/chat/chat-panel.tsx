'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WaliBanner } from './wali-banner';
import { connectChatSocket, type ChatMessagePayload } from '@/lib/chat/socket';
import { chatApi } from '@/lib/api/endpoints';

interface Props {
  roomId: number;
  expiresAt: string;
  waliMonitoring?: boolean;
  readonly?: boolean;
}

export function ChatPanel({ roomId, expiresAt, waliMonitoring, readonly }: Props) {
  const t = useTranslations('chat');
  const c = useTranslations('common');
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [expired, setExpired] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const msLeft = new Date(expiresAt).getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));

  useEffect(() => {
    if (msLeft <= 0) setExpired(true);
  }, [msLeft]);

  useEffect(() => {
    chatApi
      .getMessages(roomId)
      .then(res => {
        const data = res as { messages?: ChatMessagePayload[] };
        if (data.messages) setMessages(data.messages);
      })
      .catch(() => {});
  }, [roomId]);

  useEffect(() => {
    const socket = connectChatSocket();
    if (!socket) return;

    socket.emit('join_room', { roomId });

    const onMessage = (msg: ChatMessagePayload) => {
      setMessages(prev => [...prev, msg]);
    };

    const onExpired = () => setExpired(true);

    socket.on('message_new', onMessage);
    socket.on('room_expired', onExpired);

    return () => {
      socket.off('message_new', onMessage);
      socket.off('room_expired', onExpired);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!body.trim() || readonly || expired) return;
    const socket = connectChatSocket();
    if (!socket) return;
    setSending(true);
    socket.emit('send_message', { roomId, body: body.trim() }, () => {
      setBody('');
      setSending(false);
    });
  };

  return (
    <div className="flex flex-col h-[420px] rounded-xl border border-border overflow-hidden bg-background">
      {waliMonitoring && (
        <div className="p-3 border-b">
          <WaliBanner />
        </div>
      )}

      <div className="px-4 py-2 text-xs text-muted-foreground border-b bg-secondary/30">
        {expired ? t('expired') : t('expiresIn', { days: daysLeft })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">{t('empty')}</p>
        )}
        {messages.map(m => (
          <div key={m.id} className="rounded-lg bg-secondary/60 px-3 py-2 text-sm max-w-[85%]">
            <p className="text-[10px] text-muted-foreground mb-0.5">
              {m.senderProfile?.biodataNo ?? 'Member'}
            </p>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {!readonly && !expired && (
        <div className="flex gap-2 p-3 border-t">
          <Input
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={t('placeholder')}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <Button onClick={send} disabled={sending || !body.trim()}>
            {sending ? c('loading') : t('send')}
          </Button>
        </div>
      )}
    </div>
  );
}
