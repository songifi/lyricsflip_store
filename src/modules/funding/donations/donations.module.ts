import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { Donation } from '../../../database/entities/donation.entity';
import { FundingCampaign } from '../../../database/entities/funding-campaign.entity';
import { Supporter } from '../../../database/entities/supporter.entity';
import { User } from '../../../database/entities/user.entity';
import { SupportersService } from '../supporters/supporters.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, FundingCampaign, Supporter, User]),
  ],
  controllers: [DonationsController],
  providers: [DonationsService, SupportersService],
  exports: [DonationsService],
})
export class DonationsModule {}