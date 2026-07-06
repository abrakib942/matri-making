import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InAppNotificationService } from './notification.service';

@ApiTags('Notifications')
@UseGuards(JwtGuard)
@Controller()
export class InAppNotificationController {
  @Inject()
  private readonly notificationService: InAppNotificationService;

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/notifications')
  async list(@GetUser('id') userId: number, @Query('cursor') cursor?: string) {
    return await this.notificationService.list(
      userId,
      cursor !== undefined ? parseInt(cursor) : undefined,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('api/v1/notifications/unread-count')
  async unreadCount(@GetUser('id') userId: number) {
    return await this.notificationService.unreadCount(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/notifications/:id/read')
  async markRead(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.notificationService.markRead(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Put('api/v1/notifications/read-all')
  async markAllRead(@GetUser('id') userId: number) {
    return await this.notificationService.markAllRead(userId);
  }
}
