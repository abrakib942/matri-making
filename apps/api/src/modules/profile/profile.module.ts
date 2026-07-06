import { Module } from '@nestjs/common';
import { ProfileAccessService } from './profile-access.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileAccessService],
  exports: [ProfileService, ProfileAccessService],
})
export class ProfileModule {}
