import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionStatus } from '../entities/distribution-status.entity';
import { DistributionRelease, ReleaseStatus } from '../entities/distribution-release.entity';
import { UpdateDistributionStatusDto } from '../dto/update-distribution-status.dto';

@Injectable()
export class DistributionStatusService {
  constructor(
    private readonly statusRepository: Repository<DistributionStatus>,
    private readonly releaseRepository: Repository<DistributionRelease>,
  ) {}

  async updateStatus(
    releaseId: string,
    statusDto: UpdateDistributionStatusDto,
    updatedBy?: string,
  ): Promise<DistributionStatus> {
    const release = await this.releaseRepository.findOne({
      where: { id: releaseId },
    });

    if (!release) {
      throw new Error(`Release with ID ${releaseId} not found`);
    }

    const previousStatus = release.status;

    // Update release status
    release.status = statusDto.status;
    await this.releaseRepository.save(release);

    // Create status history entry
    const statusEntry = this.statusRepository.create({
      releaseId,
      status: statusDto.status,
      previousStatus,
      message: statusDto.message,
      metadata: statusDto.metadata,
      updatedBy,
    });

    return this.statusRepository.save(statusEntry);
  }

  async getStatusHistory(releaseId: string): Promise<DistributionStatus[]> {
    return this.statusRepository.find({
      where: { releaseId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCurrentStatus(releaseId: string): Promise<ReleaseStatus> {
    const release = await this.releaseRepository.findOne({
      where: { id: releaseId },
    });

    if (!release) {
      throw new Error(`Release with ID ${releaseId} not found`);
    }

    return release.status;
  }

  async getStatusSummary(artistId?: string): Promise<Record<ReleaseStatus, number>> {
    const queryBuilder = this.releaseRepository.createQueryBuilder('release');

    if (artistId) {
      queryBuilder.where('release.artistId = :artistId', { artistId });
    }

    const releases = await queryBuilder.getMany();

    const summary: Record<ReleaseStatus, number> = {
      [ReleaseStatus.PENDING]: 0,
      [ReleaseStatus.SCHEDULED]: 0,
      [ReleaseStatus.PROCESSING]: 0,
      [ReleaseStatus.LIVE]: 0,
      [ReleaseStatus.FAILED]: 0,
      [ReleaseStatus.CANCELLED]: 0,
    };

    releases.forEach(release => {
      summary[release.status]++;
    });

    return summary;
  }

  async getFailedReleases(artistId?: string): Promise<DistributionRelease[]> {
    const whereCondition: any = {
      status: ReleaseStatus.FAILED,
    };

    if (artistId) {
      whereCondition.artistId = artistId;
    }

    return this.releaseRepository.find({
      where: whereCondition,
      relations: ['partner'],
      order: { updatedAt: 'DESC' },
    });
  }
}
