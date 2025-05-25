import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionController } from './distribution.controller';
import { DistributionService } from './distribution.service';
import { DistributionPartnerService } from './services/distribution-partner.service';
import { ReleaseSchedulingService } from './services/release-scheduling.service';
import { DistributionStatusService } from './services/distribution-status.service';
import { MetadataSyncService } from './services/metadata-sync.service';
import { DistributionAnalyticsService } from './services/distribution-analytics.service';
import { PlatformOptimizationService } from './services/platform-optimization.service';
import { DistributionErrorService } from './services/distribution-error.service';
import { DistributionPartner } from './entities/distribution-partner.entity';
import { DistributionRelease } from './entities/distribution-release.entity';
import { DistributionStatus } from './entities/distribution-status.entity';
import { DistributionMetadata } from './entities/distribution-metadata.entity';
import { DistributionAnalytics } from './entities/distribution-analytics.entity';
import { DistributionError } from './entities/distribution-error.entity';
import { PlatformOptimization } from './entities/platform-optimization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DistributionPartner,
      DistributionRelease,
      DistributionStatus,
      DistributionMetadata,
      DistributionAnalytics,
      DistributionError,
      PlatformOptimization,
    ]),
  ],
  controllers: [DistributionController],
  providers: [
    DistributionService,
    DistributionPartnerService,
    ReleaseSchedulingService,
    DistributionStatusService,
    MetadataSyncService,
    DistributionAnalyticsService,
    PlatformOptimizationService,
    DistributionErrorService,
  ],
  exports: [DistributionService],
})
export class DistributionModule {}
