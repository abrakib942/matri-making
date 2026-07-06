import { PaymentModule } from '@/modules/payment/payment.module';
import { IntelligenceModule } from '@/modules/intelligence/intelligence.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { Module } from '@nestjs/common';
import { PostgresSearchService } from './postgres-search.service';
import { SearchController } from './search.controller';
import { SEARCH_SERVICE } from './search.interface';

@Module({
  imports: [ProfileModule, PaymentModule, IntelligenceModule],
  controllers: [SearchController],
  providers: [
    PostgresSearchService,
    { provide: SEARCH_SERVICE, useExisting: PostgresSearchService },
  ],
  exports: [SEARCH_SERVICE],
})
export class SearchModule {}
