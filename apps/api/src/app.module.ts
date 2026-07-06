import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
// System modules
import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/env';
import { DbModule } from './db/db.module';
import { UtilityModule } from './util/utility.module';

// Application modules
import { AuthorizationModule } from '@/common/authorization/authorization.module';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { FolderModule } from './modules/folder/folder.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';
import { ContentModule } from './modules/content/content.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { InterestModule } from './modules/interest/interest.module';
import { JourneyModule } from './modules/journey/journey.module';
import { MetaModule } from './modules/meta/meta.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ReportModule } from './modules/report/report.module';
import { SearchModule } from './modules/search/search.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { VerificationModule } from './modules/verification/verification.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_DATABASE_HOST'),
          port: config.get('REDIS_DATABASE_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    DbModule,
    UtilityModule,
    AuthorizationModule,
    HealthModule,
    AuthModule,
    UserModule,
    FolderModule,
    MetaModule,
    ProfileModule,
    NotificationModule,
    SearchModule,
    PaymentModule,
    InterestModule,
    IntelligenceModule,
    DashboardModule,
    VerificationModule,
    JourneyModule,
    AdminModule,
    ReportModule,
    ContentModule,
    TicketModule,
    ChatModule,
  ],
  providers: [TransformInterceptor],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
