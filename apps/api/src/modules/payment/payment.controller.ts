import { GetUser } from '@/common/decorators';
import { JwtGuard } from '@/common/guards';
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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto, UnlockBiodataDto } from './dto/index';
import { PaymentService } from './payment.service';
import { UnlockService } from './unlock.service';

@ApiTags('Payments')
@Controller()
export class PaymentController {
  @Inject()
  private readonly paymentService: PaymentService;

  @Inject()
  private readonly unlockService: UnlockService;

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/orders')
  async createOrder(@GetUser('id') userId: number, @Body() dto: CreateOrderDto) {
    return await this.paymentService.createOrder(userId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/orders')
  async listOrders(@GetUser('id') userId: number) {
    return await this.paymentService.listOrders(userId);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/orders/:id')
  async getOrder(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.getOrder(userId, id);
  }

  /** Public webhook: SSLCommerz IPN. Validated server-side, safe to expose. */
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/payments/ipn')
  async handleIpn(@Body() payload: Record<string, unknown>) {
    return await this.paymentService.handleIpn(payload);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/wallet')
  async getWallet(@GetUser('id') userId: number) {
    return await this.paymentService.getWallet(userId);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/invoices')
  async listInvoices(@GetUser('id') userId: number) {
    return await this.paymentService.listInvoices(userId);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/entitlements')
  async getEntitlements(@GetUser('id') userId: number) {
    return await this.paymentService.getMyEntitlements(userId);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/profiles/:id/unlock')
  async unlockBiodata(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UnlockBiodataDto,
  ) {
    return await this.unlockService.unlockBiodata(userId, id, dto.type);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/me/unlocks')
  async listMyUnlocks(@GetUser('id') userId: number) {
    return await this.unlockService.listMyUnlocks(userId);
  }
}
