import { DbService } from '@/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@Injectable()
export class ChatAuthService {
  @Inject(DbService)
  private readonly db: DbService;

  @Inject()
  private readonly jwt: JwtService;

  @Inject()
  private readonly config: ConfigService;

  async validateSocketToken(token: string): Promise<{ userId: number } | null> {
    try {
      const payload = this.jwt.verify<{ email: string }>(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      const user = await this.db.user.findFirst({
        where: { email: payload.email, status: 'ACTIVE' },
        select: { id: true },
      });

      return user ? { userId: user.id } : null;
    } catch {
      return null;
    }
  }
}

export { ChatService };
