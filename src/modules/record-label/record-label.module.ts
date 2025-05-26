import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { LabelContract } from './entities/label-contract.entity';
import { RoyaltyPayment } from './entities/royalty-payment.entity';
import { ReleaseCampaign } from './entities/release-campaign.entity';
import { CampaignTask } from './entities/campaign-task.entity';
import { LabelBranding } from './entities/label-branding.entity';
import { LabelsService } from './services/labels.service';
import { ContractsService } from './services/contracts.service';
import { CampaignsService } from './services/campaigns.service';
import { BrandingService } from './services/branding.service';
import { LabelsController } from './controllers/labels.controller';
import { ContractsController } from './controllers/contracts.controller';
import { CampaignsController } from './controllers/campaigns.controller';
import { BrandingController } from './controllers/branding.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Label,
      LabelContract,
      RoyaltyPayment,
      ReleaseCampaign,
      CampaignTask,
      LabelBranding,
    ]),
  ],
  controllers: [
    LabelsController,
    ContractsController,
    CampaignsController,
    BrandingController,
  ],
  providers: [
    LabelsService,
    ContractsService,
    CampaignsService,
    BrandingService,
  ],
  exports: [
    LabelsService,
    ContractsService,
    CampaignsService,
    BrandingService,
  ],
})
export class LabelsModule {}