import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DonationsModule } from './donations/donations.module';
import { SupportersModule } from './supporters/supporters.module';
import { FundingAnalyticsModule } from './analytics/funding-analytics.module';
import { FundingNotificationsModule } from './notifications/funding-notifications.module';

@Module({
  imports: [
    CampaignsModule,
    DonationsModule,
    SupportersModule,
    FundingAnalyticsModule,
    FundingNotificationsModule,
  ],
  exports: [
    CampaignsModule,
    DonationsModule,
    SupportersModule,
    FundingAnalyticsModule,
  ],
})
export class FundingModule {}