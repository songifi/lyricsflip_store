import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './controller/subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { BillingService } from './services/billing.service';
import { AccessControlService } from './services/access-control.service';
import { AnalyticsService } from './services/analytics.service';
import { NotificationService } from './services/notification.service';

import { Subscription } from './entities/subscription.entity';
import { SubscriptionTier } from './entities/tier.entity';
import { GroupSubscription } from './entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionTier, GroupSubscription])],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    BillingService,
    AccessControlService,
    AnalyticsService,
    NotificationService,
  ],
  exports: [
    SubscriptionService,
    AccessControlService,
    AnalyticsService,
  ]
})
export class SubscriptionModule {}
