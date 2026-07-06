import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface InitSessionParams {
  orderNo: string;
  amountBdt: number; // decimal taka
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
}

export interface InitSessionResult {
  sessionKey: string;
  gatewayUrl: string;
}

export interface ValidationResult {
  valid: boolean;
  amountBdt: number;
  tranId: string;
  bankTranId?: string;
  cardType?: string;
  raw: Record<string, unknown>;
}

/**
 * Thin SSLCommerz gateway client (session init + IPN validation).
 * Covers bKash, Nagad, rocket, cards etc. through the hosted gateway page.
 */
@Injectable()
export class SslCommerzService {
  private readonly logger = new Logger(SslCommerzService.name);

  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    const sandbox = this.config.get<string>('SSLCOMMERZ_SANDBOX') !== 'false';
    return sandbox ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com';
  }

  private get storeId(): string {
    return this.config.get<string>('SSLCOMMERZ_STORE_ID') ?? '';
  }

  private get storePassword(): string {
    return this.config.get<string>('SSLCOMMERZ_STORE_PASSWORD') ?? '';
  }

  isConfigured(): boolean {
    return !!this.storeId && !!this.storePassword;
  }

  async initSession(params: InitSessionParams): Promise<InitSessionResult> {
    const apiBase = this.config.get<string>('API_BASE_URL') ?? 'http://localhost:5002';

    const payload = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: params.amountBdt.toFixed(2),
      currency: 'BDT',
      tran_id: params.orderNo,
      success_url: this.config.get<string>('PAYMENT_SUCCESS_URL') ?? `${apiBase}/payment/success`,
      fail_url: this.config.get<string>('PAYMENT_FAIL_URL') ?? `${apiBase}/payment/fail`,
      cancel_url: this.config.get<string>('PAYMENT_CANCEL_URL') ?? `${apiBase}/payment/cancel`,
      ipn_listener_url: `${apiBase}/api/v1/payments/ipn`,
      shipping_method: 'NO',
      product_name: params.productName,
      product_category: 'Service',
      product_profile: 'non-physical-goods',
      cus_name: params.customerName,
      cus_email: params.customerEmail,
      cus_add1: 'N/A',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: params.customerPhone ?? 'N/A',
    });

    const response = await axios.post(`${this.baseUrl}/gwprocess/v4/api.php`, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    });

    const data = response.data as {
      status?: string;
      sessionkey?: string;
      GatewayPageURL?: string;
      failedreason?: string;
    };

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL || !data.sessionkey) {
      this.logger.error(`SSLCommerz session init failed: ${data.failedreason ?? 'unknown'}`);
      throw new Error(`Payment session could not be created: ${data.failedreason ?? 'unknown'}`);
    }

    return { sessionKey: data.sessionkey, gatewayUrl: data.GatewayPageURL };
  }

  /**
   * Server-side validation of an IPN callback using the validator API.
   * Never trust IPN payloads without this step.
   */
  async validateTransaction(valId: string): Promise<ValidationResult> {
    const url = `${this.baseUrl}/validator/api/validationserverAPI.php`;

    const response = await axios.get(url, {
      params: {
        val_id: valId,
        store_id: this.storeId,
        store_passwd: this.storePassword,
        format: 'json',
      },
      timeout: 15000,
    });

    const data = response.data as Record<string, unknown>;
    const status = data.status as string | undefined;

    return {
      valid: status === 'VALID' || status === 'VALIDATED',
      amountBdt: parseFloat((data.amount as string) ?? '0'),
      tranId: (data.tran_id as string) ?? '',
      bankTranId: data.bank_tran_id as string | undefined,
      cardType: data.card_type as string | undefined,
      raw: data,
    };
  }
}
