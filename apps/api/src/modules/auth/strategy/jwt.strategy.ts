import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DbService } from '@/db/db.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly config: ConfigService,
    private readonly db: DbService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { email: string }): Promise<any> {
    try {
      const user = await this.db.user.findFirst({
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          permissions: {
            include: { permission: true },
          },
        },
        where: {
          email: payload.email,
          status: 'ACTIVE',
        },
      });

      if (!user) {
        return false;
      }

      const { roles, permissions, ...rest } = user;

      return {
        ...rest,
        roles: roles.map(({ role }) => role),
        directPermissions: permissions.map(({ permission }) => permission),
      };
    } catch (error) {
      console.error('error', error);

      return false;
    }
  }
}
