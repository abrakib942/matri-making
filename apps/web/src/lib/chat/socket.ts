'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getStoredTokens } from '@/lib/api/client';

export interface ChatMessagePayload {
  id: number;
  roomId: number;
  body: string;
  createdAt: string;
  senderProfileId: number;
  senderProfile?: { id: number; biodataNo: string; fullName?: string | null };
  readonly?: boolean;
}

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:5002';

let socket: Socket | null = null;

export function connectChatSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  const { accessToken } = getStoredTokens();
  if (!accessToken) return null;

  if (socket?.connected) return socket;

  socket = io(`${WS_BASE}/chat`, {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnection: true,
  });

  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
}

export function useChatRoom(roomId: number, onMessage: (msg: ChatMessagePayload) => void) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const s = connectChatSocket();
    if (!s) return;

    s.emit('join_room', { roomId });

    const listener = (msg: ChatMessagePayload) => handlerRef.current(msg);
    s.on('message_new', listener);

    return () => {
      s.off('message_new', listener);
    };
  }, [roomId]);
}
