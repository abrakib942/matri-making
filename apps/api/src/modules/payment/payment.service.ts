import {
  createErrorResult,
  createSuccessResult,
  ServiceResult,
} from '@/common/interfaces/service-result.interface';
import { DbService } from '@/db/db.service';
import { InAppNotificationService } from '@/modules/notification/notification.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Order, PlanInterval, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { CreateOrderDto } from './dto/index';
import { FeatureGateService } from './feature-gate.service';
import { SslCommerzService } from './sslcommerz.service';

const INTERVAL_DAYS: Record<PlanInterval, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  YEARLY: 365,
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly sslcommerz: SslCommerzService;

  @Inject()
  private readonly featureGate: FeatureGateService;

  @Inject()
  private readonly notifications: InAppNotificationService;

  private generateOrderNo(): string {
    return `ORD-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  // ---------- orders ----------

  async createOrder(userId: number, dto: CreateOrderDto): Promise<ServiceResult> {
    let amountPaisa: number;
    let productName: string;

    if (dto.type === 'CREDIT_PACKAGE') {
      const pkg = await this.db.creditPackage.findUnique({ where: { key: dto.itemKey } });

      if (!pkg || !pkg.isActive) {
        return createErrorResult(
          { name: 'badRequest', message: 'Credit package not found' },
          'Credit package not found',
        );
      }

      amountPaisa = pkg.pricePaisa;
      productName = pkg.nameEn;
    } else {
      const plan = await this.db.plan.findUnique({ where: { key: dto.itemKey } });

      if (!plan || !plan.isActive) {
        return createErrorResult(
          { name: 'badRequest', message: 'Plan not found' },
          'Plan not found',
        );
      }

      amountPaisa = plan.pricePaisa;
      productName = plan.nameEn;
    }

    const user = await this.db.user.findUnique({ where: { id: userId } });

    const order = await this.db.order.create({
      data: {
        orderNo: this.generateOrderNo(),
        userId,
        type: dto.type,
        itemKey: dto.itemKey,
        amountPaisa,
      },
    });

    if (!this.sslcommerz.isConfigured()) {
      return createSuccessResult(
        { order, gatewayUrl: null, warning: 'Payment gateway is not configured' },
        'Order created; payment gateway is not configured yet',
      );
    }

    const session = await this.sslcommerz.initSession({
      orderNo: order.orderNo,
      amountBdt: amountPaisa / 100,
      customerName: user!.name,
      customerEmail: user!.email,
      customerPhone: user!.phone ?? undefined,
      productName,
    });

    await this.db.payment.create({
      data: {
        orderId: order.id,
        provider: 'SSLCOMMERZ',
        status: 'INITIATED',
        amountPaisa,
        sessionKey: session.sessionKey,
      },
    });

    return createSuccessResult(
      { order, gatewayUrl: session.gatewayUrl },
      'Order created; redirect the user to the gateway URL',
    );
  }

  async listOrders(userId: number): Promise<ServiceResult> {
    const orders = await this.db.order.findMany({
      where: { userId },
      include: { payments: true, invoice: true },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(orders, 'Orders retrieved successfully');
  }

  async getOrder(userId: number, orderId: number): Promise<ServiceResult> {
    const order = await this.db.order.findFirst({
      where: { id: orderId, userId },
      include: { payments: true, invoice: true, subscription: true },
    });

    if (!order) {
      return createErrorResult(
        { name: 'badRequest', message: 'Order not found' },
        'Order not found',
      );
    }

    return createSuccessResult(order, 'Order retrieved successfully');
  }

  // ---------- IPN ----------

  /**
   * SSLCommerz IPN webhook handler. Validates against the validator API and
   * fulfills idempotently (gateway retries are safe).
   */
  async handleIpn(payload: Record<string, unknown>): Promise<ServiceResult> {
    const valId = payload.val_id as string | undefined;
    const tranId = payload.tran_id as string | undefined;

    if (!valId || !tranId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Missing val_id or tran_id' },
        'Invalid IPN payload',
      );
    }

    const order = await this.db.order.findUnique({ where: { orderNo: tranId } });

    if (!order) {
      return createErrorResult({ name: 'badRequest', message: 'Unknown order' }, 'Unknown order');
    }

    if (order.status === 'PAID') {
      return createSuccessResult({ alreadyProcessed: true }, 'Order already fulfilled');
    }

    const validation = await this.sslcommerz.validateTransaction(valId);

    const expectedBdt = order.amountPaisa / 100;
    const amountOk = Math.abs(validation.amountBdt - expectedBdt) < 0.01;

    if (!validation.valid || !amountOk) {
      await this.db.payment.updateMany({
        where: { orderId: order.id, status: 'INITIATED' },
        data: {
          status: 'FAILED',
          gatewayPayload: validation.raw as Prisma.InputJsonValue,
        },
      });

      await this.db.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });

      this.logger.warn(
        `IPN validation failed for order ${order.orderNo} (valid=${validation.valid}, amountOk=${amountOk})`,
      );

      return createErrorResult(
        { name: 'badRequest', message: 'Transaction validation failed' },
        'Transaction validation failed',
      );
    }

    await this.fulfillOrder(order, validation.raw, validation.bankTranId);

    return createSuccessResult({ fulfilled: true }, 'Payment processed successfully');
  }

  private async fulfillOrder(
    order: Order,
    gatewayPayload: Record<string, unknown>,
    gatewayTxnId?: string,
  ): Promise<void> {
    await this.db.$transaction(async tx => {
      // Idempotency guard inside the transaction.
      const fresh = await tx.order.findUnique({ where: { id: order.id } });
      if (!fresh || fresh.status === 'PAID') return;

      await tx.order.update({ where: { id: order.id }, data: { status: 'PAID' } });

      const payment = await tx.payment.findFirst({
        where: { orderId: order.id },
        orderBy: { id: 'desc' },
      });

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            gatewayTxnId,
            gatewayPayload: gatewayPayload as Prisma.InputJsonValue,
            validatedAt: new Date(),
          },
        });
      } else {
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: 'SSLCOMMERZ',
            status: 'SUCCESS',
            amountPaisa: order.amountPaisa,
            gatewayTxnId,
            gatewayPayload: gatewayPayload as Prisma.InputJsonValue,
            validatedAt: new Date(),
          },
        });
      }

      await tx.invoice.create({
        data: {
          invoiceNo: `INV-${new Date().getFullYear()}-${String(order.id).padStart(6, '0')}`,
          orderId: order.id,
          amountPaisa: order.amountPaisa,
        },
      });

      if (order.type === 'CREDIT_PACKAGE') {
        const pkg = await tx.creditPackage.findUnique({ where: { key: order.itemKey } });

        if (pkg) {
          const wallet = await tx.creditWallet.upsert({
            where: { userId: order.userId },
            update: { balance: { increment: pkg.credits } },
            create: { userId: order.userId, balance: pkg.credits },
          });

          await tx.creditLedger.create({
            data: {
              walletId: wallet.id,
              type: 'PURCHASE',
              amount: pkg.credits,
              reference: order.orderNo,
              note: pkg.nameEn,
            },
          });
        }
      } else {
        const plan = await tx.plan.findUnique({ where: { key: order.itemKey } });

        if (plan) {
          const startsAt = new Date();
          const endsAt = new Date(
            startsAt.getTime() + INTERVAL_DAYS[plan.interval] * 24 * 60 * 60 * 1000,
          );

          await tx.subscription.create({
            data: {
              userId: order.userId,
              planId: plan.id,
              status: 'ACTIVE',
              startsAt,
              endsAt,
              orderId: order.id,
            },
          });

          // Denormalize premium status onto the user's profiles.
          const memberships = await tx.profileMember.findMany({
            where: { userId: order.userId, inviteStatus: 'ACCEPTED' },
            select: { profileId: true },
          });

          if (memberships.length) {
            await tx.profile.updateMany({
              where: { id: { in: memberships.map(m => m.profileId) } },
              data: { isPremium: true },
            });
          }
        }
      }
    });

    this.featureGate.invalidate(order.userId);

    await this.notifications.notify(order.userId, {
      type: order.type === 'SUBSCRIPTION' ? 'SUBSCRIPTION_ACTIVATED' : 'PAYMENT_SUCCESS',
      titleEn: 'Payment successful',
      titleBn: 'পেমেন্ট সফল হয়েছে',
      bodyEn: `Your payment for order ${order.orderNo} has been received.`,
      bodyBn: `অর্ডার ${order.orderNo} এর পেমেন্ট গৃহীত হয়েছে।`,
      data: { orderId: order.id },
    });
  }

  // ---------- wallet & invoices ----------

  async getWallet(userId: number): Promise<ServiceResult> {
    const wallet = await this.db.creditWallet.findUnique({
      where: { userId },
      include: { entries: { orderBy: { id: 'desc' }, take: 50 } },
    });

    return createSuccessResult(
      wallet ?? { userId, balance: 0, entries: [] },
      'Wallet retrieved successfully',
    );
  }

  async listInvoices(userId: number): Promise<ServiceResult> {
    const invoices = await this.db.invoice.findMany({
      where: { order: { userId } },
      include: { order: { select: { orderNo: true, type: true, itemKey: true, status: true } } },
      orderBy: { id: 'desc' },
    });

    return createSuccessResult(invoices, 'Invoices retrieved successfully');
  }

  async getMyEntitlements(userId: number): Promise<ServiceResult> {
    const features = await this.featureGate.getFeatures(userId);
    const isPremium = await this.featureGate.isPremium(userId);

    return createSuccessResult({ isPremium, features }, 'Entitlements retrieved successfully');
  }
}
