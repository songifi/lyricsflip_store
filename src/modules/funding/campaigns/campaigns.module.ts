import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { FundingCampaign } from '../../../database/entities/funding-campaign.entity';
import { Donation } from '../../../database/entities/donation.entity';
import { Supporter } from '../../../database/entities/supporter.entity';
import { User } from '../../../database/entities/user.entity';
import { Album } from '../../../database/entities/album.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FundingCampaign,
      Donation,
      Supporter,
      User,
      Album,
    ]),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}