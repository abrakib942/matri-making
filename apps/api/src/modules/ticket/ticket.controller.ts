import { CheckAbility, GetUser } from '@/common/decorators';
import { JwtGuard, PermissionGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import { CreateTicketDto, TicketMessageDto, UpdateTicketStatusDto } from './dto/index';
import { TicketService } from './ticket.service';

@ApiTags('Support')
@Controller()
export class TicketController {
  @Inject()
  private readonly ticketService: TicketService;

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/tickets')
  async createTicket(@GetUser('id') userId: number, @Body() dto: CreateTicketDto) {
    return await this.ticketService.createTicket(userId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/tickets')
  async listMyTickets(@GetUser('id') userId: number) {
    return await this.ticketService.listMyTickets(userId);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/tickets/:id/messages')
  async addMessage(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TicketMessageDto,
  ) {
    return await this.ticketService.addMessage(userId, id, dto, false);
  }

  // ---------- admin ----------

  @CheckAbility({ subject: 'ticket', action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/admin/tickets')
  async listTickets(@Query('status') status?: TicketStatus) {
    return await this.ticketService.listTickets(status);
  }

  @CheckAbility({ subject: 'ticket', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/admin/tickets/:id/messages')
  async addStaffMessage(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TicketMessageDto,
  ) {
    return await this.ticketService.addMessage(userId, id, dto, true);
  }

  @CheckAbility({ subject: 'ticket', action: 'update' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Put('api/v1/admin/tickets/:id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketStatusDto) {
    return await this.ticketService.updateStatus(id, dto);
  }
}
