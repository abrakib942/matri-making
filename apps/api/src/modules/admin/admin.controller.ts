import { CheckAbility } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import {
  Body,
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
import { AdminService } from './admin.service';
import { AdminListProfilesDto, RejectProfileDto } from './dto/index';

@ApiTags('Admin')
@UseGuards(PermissionGuard)
@Controller()
export class AdminController {
  @Inject()
  private readonly adminService: AdminService;

  // ---------- profile moderation ----------

  @CheckAbility({ subject: 'profile', action: 'read' })
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/profiles')
  async listProfiles(@Query() dto: AdminListProfilesDto) {
    return await this.adminService.listProfiles(dto);
  }

  @CheckAbility({ subject: 'profile', action: 'read' })
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/profiles/:id')
  async getProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.adminService.getProfile(id);
  }

  @CheckAbility({ subject: 'profile', action: 'update' })
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/profiles/:id/approve')
  async approveProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.adminService.approveProfile(id);
  }

  @CheckAbility({ subject: 'profile', action: 'update' })
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/profiles/:id/reject')
  async rejectProfile(@Param('id', ParseIntPipe) id: number, @Body() dto: RejectProfileDto) {
    return await this.adminService.rejectProfile(id, dto);
  }

  @CheckAbility({ subject: 'profile', action: 'update' })
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/profiles/:id/block')
  async blockProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.adminService.blockProfile(id);
  }

  @CheckAbility({ subject: 'profile', action: 'update' })
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/profiles/:id/unblock')
  async unblockProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.adminService.unblockProfile(id);
  }

  // ---------- payments audit ----------

  @CheckAbility({ subject: 'payment', action: 'read' })
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/orders')
  async listOrders(@Query('cursor') cursor?: string) {
    return await this.adminService.listOrders(cursor !== undefined ? parseInt(cursor) : undefined);
  }

  @CheckAbility({ subject: 'payment', action: 'read' })
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/subscriptions')
  async listSubscriptions() {
    return await this.adminService.listSubscriptions();
  }

  @CheckAbility({ subject: 'payment', action: 'read' })
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/unlocks')
  async listUnlocks() {
    return await this.adminService.listUnlocks();
  }

  // ---------- analytics ----------

  @CheckAbility({ subject: 'profile', action: 'read' })
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/analytics')
  async getAnalytics() {
    return await this.adminService.getAnalytics();
  }
}
