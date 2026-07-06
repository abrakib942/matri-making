import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatAuthService } from './chat-auth.service';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  @Inject()
  private readonly chat: ChatService;

  @Inject()
  private readonly auth: ChatAuthService;

  private readonly userSockets = new Map<number, Set<string>>();

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers.authorization?.replace('Bearer ', '') ?? '');

    const user = await this.auth.validateSocketToken(token);
    if (!user) {
      client.disconnect();
      return;
    }

    client.data.userId = user.userId;
    const set = this.userSockets.get(user.userId) ?? new Set();
    set.add(client.id);
    this.userSockets.set(user.userId, set);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as number | undefined;
    if (!userId) return;
    const set = this.userSockets.get(userId);
    if (!set) return;
    set.delete(client.id);
    if (set.size === 0) this.userSockets.delete(userId);
  }

  @SubscribeMessage('join_room')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: number }) {
    const userId = client.data.userId as number;
    const participant = await this.chat.isParticipant(userId, data.roomId);
    if (!participant) {
      return { error: 'FORBIDDEN' };
    }

    await client.join(`room:${data.roomId}`);
    return {
      ok: true,
      role: participant.role,
      readonly: participant.role === 'WALI' || participant.role === 'READONLY',
    };
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; body: string },
  ) {
    const userId = client.data.userId as number;
    const result = await this.chat.sendMessage(userId, data.roomId, data.body);

    if ('error' in result) {
      return { error: result.error };
    }

    const payload = {
      ...result.message,
      readonly: false,
    };

    this.server.to(`room:${data.roomId}`).emit('message_new', payload);

    const waliPayload = { ...payload, readonly: true };
    const participants = await this.chat.isParticipant(userId, data.roomId);
    if (participants?.role === 'MEMBER') {
      this.server.to(`room:${data.roomId}`).emit('wali_presence', { roomId: data.roomId });
    }

    return { ok: true, message: waliPayload };
  }

  @SubscribeMessage('mark_read')
  markRead(@MessageBody() _data: { roomId: number; messageId: number }) {
    return { ok: true };
  }

  emitRoomExpired(roomId: number) {
    this.server.to(`room:${roomId}`).emit('room_expired', { roomId });
  }
}
