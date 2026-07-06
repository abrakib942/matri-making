import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import {
  createErrorResult,
  createSuccessResult,
} from '@/common/interfaces/service-result.interface';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@UseGuards(JwtGuard)
@Controller()
export class ChatController {
  @Inject()
  private readonly chat: ChatService;

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/chat-rooms')
  async listRooms(@GetUser('id') userId: number) {
    const rooms = await this.chat.listRoomsForUser(userId);
    return createSuccessResult(rooms, 'Chat rooms retrieved');
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/chat-rooms/:id/messages')
  async getMessages(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) roomId: number,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.chat.getRoomHistory(
      userId,
      roomId,
      cursor ? Number(cursor) : undefined,
    );

    if (!result) {
      return createErrorResult({ name: 'forbidden', message: 'Not a participant' }, 'Forbidden');
    }

    return createSuccessResult(result, 'Messages retrieved');
  }
}
