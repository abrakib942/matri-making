import { Global, Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { DbModule } from '@/db/db.module';

@Global()
@Module({
  imports: [DbModule],
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class AuthorizationModule {}
