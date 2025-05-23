import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as Joi from 'joi'

import { AppController } from './app.controller'
import { AppService } from './app.service'

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

import { APP_GUARD, Reflector } from '@nestjs/core'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
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
