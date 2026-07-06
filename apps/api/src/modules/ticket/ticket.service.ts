import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { CreateTicketDto, TicketMessageDto, UpdateTicketStatusDto } from './dto/index';

@Injectable()
export class TicketService {
  @Inject(DbService)
  private readonly db: DbService;

  async createTicket(userId: number, dto: CreateTicketDto): Promise<ServiceResult> {
    const data = await this.db.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        priority: dto.priority ?? 'MEDIUM',
        messages: {
          create: { senderId: userId, isStaff: false, message: dto.message },
        },
      },
      include: { messages: true },
    });

    return createSuccessResult(data, 'Support ticket created');
  }

  async listMyTickets(userId: number): Promise<ServiceResult> {
    const tickets = await this.db.supportTicket.findMany({
      where: { userId },
      include: { messages: { orderBy: { id: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    return createSuccessResult(tickets, 'Tickets retrieved successfully');
  }

  async addMessage(
    userId: number,
    ticketId: number,
    dto: TicketMessageDto,
    isStaff: boolean,
  ): Promise<ServiceResult> {
    const ticket = await this.db.supportTicket.findUnique({ where: { id: ticketId } });

    if (!ticket || (!isStaff && ticket.userId !== userId)) {
      return createErrorResult(
        { name: 'badRequest', message: 'Ticket not found' },
        'Ticket not found',
      );
    }

    if (ticket.status === 'CLOSED') {
      return createErrorResult(
        { name: 'badRequest', message: 'This ticket is closed' },
        'This ticket is closed',
      );
    }

    const message = await this.db.supportTicketMessage.create({
      data: { ticketId, senderId: userId, isStaff, message: dto.message },
    });

    await this.db.supportTicket.update({
      where: { id: ticketId },
      data: { status: isStaff ? 'IN_PROGRESS' : ticket.status },
    });

    return createSuccessResult(message, 'Message added');
  }

  // ---------- admin ----------

  async listTickets(status?: TicketStatus): Promise<ServiceResult> {
    const tickets = await this.db.supportTicket.findMany({
      where: status ? { status } : { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { id: 'asc' } },
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'asc' }],
    });

    return createSuccessResult(tickets, 'Tickets retrieved successfully');
  }

  async updateStatus(ticketId: number, dto: UpdateTicketStatusDto): Promise<ServiceResult> {
    const ticket = await this.db.supportTicket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      return createErrorResult(
        { name: 'badRequest', message: 'Ticket not found' },
        'Ticket not found',
      );
    }

    const data = await this.db.supportTicket.update({
      where: { id: ticketId },
      data: { status: dto.status, ...(dto.priority ? { priority: dto.priority } : {}) },
    });

    return createSuccessResult(data, 'Ticket updated');
  }
}
