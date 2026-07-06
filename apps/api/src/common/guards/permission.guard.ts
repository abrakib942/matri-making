import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtGuard } from './jwt.guard';
import { AbilityFactory } from '@/common/authorization/ability.factory';
import { CHECK_ABILITY_KEY, RequiredAbility } from '@/common/decorators';

@Injectable()
export class PermissionGuard extends JwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const requirements =
      this.reflector.getAllAndOverride<RequiredAbility[]>(CHECK_ABILITY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requirements.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id?: number }; ability?: unknown }>();
    const user = request.user;

    if (!user || typeof user.id !== 'number') {
      return false;
    }

    const ability = await this.abilityFactory.createForUser(user.id);

    request.ability = ability;

    const hasAccess = requirements.every(requirement =>
      ability.can(requirement.action, requirement.subject),
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}
