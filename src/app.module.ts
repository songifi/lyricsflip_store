import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD, Reflector } from '@nestjs/core'

import { validationSchema } from './config/validation.schema'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { RolesGuard } from './common/guards/roles.guard'

import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { ArtistsModule } from './modules/artists/artists.module'
import { MusicModule } from './modules/music/music.module'
import { MerchandiseModule } from './modules/merchandise/merchandise.module'
import { StreamingModule } from './modules/streaming/streaming.module'
import { PurchasesModule } from './modules/purchases/purchases.module'
import { EventsModule } from './modules/events/events.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { AdminModule } from './modules/admin/admin.module'
import { TracksModule } from './modules/music/tracks/tracks.module'
import appConfig, { databaseConfig } from './config/database.config'
import { BandsModule } from './modules/bands/bands.module';
import { VideosModule } from './modules/videos/videos.module';
import { FundingModule } from './modules/funding/funding.module';
import { DistributionsModule } from './modules/distributions/distributions.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { AnalyticsDashboardModule } from './modules/analytics-dashboard/analytics-dashboard.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { SecurityModule } from './modules/security/security.module';
import { PerformanceOptimizationModule } from './modules/performance-optimization/performance-optimization.module';
import { PodcastModule } from './modules/podcast/podcast.module';
import { LivestreamModule } from './modules/livestream/livestream.module';
import { EducationModule } from './modules/education/education.module';
import { ContestModule } from './modules/contest/contest.module';
import { GearModule } from './modules/gear/gear.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { RecordLabelModule } from './modules/record-label/record-label.module';
import { RightsModule } from './modules/rights/rights.module';
import { SyncModule } from './modules/sync/sync.module';
import { WellnessModule } from './modules/wellness/wellness.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env.local', '.env'],
    }),

     ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (global fallback)
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'), 
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('nodeEnv') === 'development',
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
    }),

    AuthModule,
    UsersModule,
    ArtistsModule,
    MusicModule,
    MerchandiseModule,
    StreamingModule,
    PurchasesModule,
    EventsModule,
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
    TracksModule,
    BandsModule,
    VideosModule,
    FundingModule,
    DistributionsModule,
    InventoryModule,
    I18nModule,
    AnalyticsDashboardModule,
    ModerationModule,
    SecurityModule,
    PerformanceOptimizationModule,
    PodcastModule,
    LivestreamModule,
    EducationModule,
    ContestModule,
    GearModule,
    CollaborationModule,
    RecordLabelModule,
    RightsModule,
    SyncModule,
    WellnessModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
