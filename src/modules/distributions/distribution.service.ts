import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionRelease } from './entities/distribution-release.entity';
import { CreateDistributionReleaseDto } from './dto/create-distribution-release.dto';
import { UpdateDistributionStatusDto } from './dto/update-distribution-status.dto';
import { DistributionPartnerService } from './services/distribution-partner.service';
import { ReleaseSchedulingService } from './services/release-scheduling.service';
import { DistributionStatusService } from './services/distribution-status.service';
import { MetadataSyncService } from './services/metadata-sync.service';
import { DistributionAnalyticsService } from './services/distribution-analytics.service';
import { DistributionErrorService } from './services/distribution-error.service';

@Injectable()
export class DistributionService {
  constructor(
    private readonly releaseRepository: Repository<DistributionRelease>,
    private readonly partnerService: DistributionPartnerService,
    private readonly schedulingService: ReleaseSchedulingService,
    private readonly statusService: DistributionStatusService,
    private readonly metadataService: MetadataSyncService,
    private readonly analyticsService: DistributionAnalyticsService,
    private readonly errorService: DistributionErrorService,
    @InjectRepository(DistributionRelease)
  ) {}

  async createRelease(createReleaseDto: CreateDistributionReleaseDto): Promise<DistributionRelease> {
    const partner = await this.partnerService.findByPlatform(createReleaseDto.platform);
    
    const release = this.releaseRepository.create({
      ...createReleaseDto,
      partnerId: partner.id,
    });

    const savedRelease = await this.releaseRepository.save(release);

    // Create initial status entry
    await this.statusService.updateStatus(savedRelease.id, {
      status: savedRelease.status,
      message: 'Release created',
    });

    return savedRelease;
  }

  async getReleases(artistId?: string, platform?: string, status?: string): Promise<DistributionRelease[]> {
    const whereCondition: any = {};

    if (artistId) whereCondition.artistId = artistId;
    if (status) whereCondition.status = status;

    const queryBuilder = this.releaseRepository
      .createQueryBuilder('release')
      .leftJoinAndSelect('release.partner', 'partner');

    if (Object.keys(whereCondition).length > 0) {
      Object.entries(whereCondition).forEach(([key, value], index) => {
        if (index === 0) {
          queryBuilder.where(`release.${key} = :${key}`, { [key]: value });
        } else {
          queryBuilder.andWhere(`release.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (platform) {
      queryBuilder.andWhere('partner.platform = :platform', { platform });
    }

    return queryBuilder.orderBy('release.createdAt', 'DESC').getMany();
  }

  async getRelease(id: string): Promise<DistributionRelease> {
    return this.releaseRepository.findOne({
      where: { id },
      relations: ['partner', 'statusHistory'],
    });
  }

  async updateReleaseStatus(id: string, updateStatusDto: UpdateDistributionStatusDto): Promise<any> {
    return this.statusService.updateStatus(id, updateStatusDto);
  }

  async scheduleRelease(id: string, scheduledDate: Date): Promise<DistributionRelease> {
    return this.schedulingService.scheduleRelease(id, scheduledDate);
  }

  async cancelScheduledRelease(id: string): Promise<DistributionRelease> {
    return this.schedulingService.cancelScheduledRelease(id);
  }

  async getStatusHistory(id: string): Promise<any[]> {
    return this.statusService.getStatusHistory(id);
  }

  async getReleaseAnalytics(
    id: string,
    platform?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    return this.analyticsService.getAggregatedAnalytics(id, platform, startDate, endDate);
  }

  async getDistributionPartners(): Promise<any[]> {
    return this.partnerService.findAll();
  }

  async getAnalyticsSummary(artistId?: string): Promise<any> {
    const statusSummary = await this.statusService.getStatusSummary(artistId);
    const topReleases = await this.analyticsService.getTopPerformingReleases(artistId);
    
    return {
      statusSummary,
      topReleases,
    };
  }

  async syncMetadata(id: string, platform?: string): Promise<any> {
    if (platform) {
      return this.metadataService.syncMetadata(id, platform);
    } else {
      // Sync with all platforms for this release
      const release = await this.getRelease(id);
      return this.metadataService.syncMetadata(id, release.partner.platform);
    }
  }

  async getMetadataStatus(id: string): Promise<any[]> {
    return this.metadataService.getMetadataStatus(id);
  }

  async getDistributionErrors(releaseId?: string, platform?: string, resolved?: boolean): Promise<any[]> {
    return this.errorService.getErrors(releaseId, platform, resolved);
  }

  async resolveError(id: string, resolution: string): Promise<any> {
    return this.errorService.resolveError(id, resolution);
  }
}
