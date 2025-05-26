import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { NotificationController } from './controller/notification.controller';
import { NotificationService } from './service/notification.service';
import { PushService } from './service/push.service';
import { EmailService } from './service/email.service';
import { SchedulerService } from './service/scheduler.service';
import { AnalyticsService } from './service/analytics.service';
import { NotificationGateway } from './gateway/notification.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    PushService,
    EmailService,
    SchedulerService,
    AnalyticsService,
    NotificationGateway,
  ],
})
export class NotificationModule {}