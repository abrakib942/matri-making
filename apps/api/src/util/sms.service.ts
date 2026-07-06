import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ISmsPayload {
  to: string;
  message: string;
}

/**
 * SMS provider abstraction. The default "console" provider logs messages
 * instead of sending them; a real provider (e.g. SSL Wireless, BulkSMS BD)
 * can be plugged in via the SMS_PROVIDER env var.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendSms(payload: ISmsPayload): Promise<void> {
    const provider = this.config.get<string>('SMS_PROVIDER') ?? 'console';

    switch (provider) {
      case 'console':
      default:
        this.logger.log(`[SMS -> ${payload.to}] ${payload.message}`);
        return Promise.resolve();
    }
  }
}
