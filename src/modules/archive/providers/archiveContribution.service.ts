import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchiveContribution, ContributionType } from '../entities/archive-contribution.entity';
import { CreateContributionDto } from '../dto/create-contribution.dto';

@Injectable()
export class ArchiveContributionService {
  constructor(
    @InjectRepository(ArchiveContribution)
    private contributionRepository: Repository<ArchiveContribution>,
  ) {}

  async create(createContributionDto: CreateContributionDto, contributorId: string): Promise<ArchiveContribution> {
    const contribution = this.contributionRepository.create({
      ...createContributionDto,
      contributorId,
    });

    return await this.contributionRepository.save(contribution);
  }

  async findByArchive(archiveId: string): Promise<ArchiveContribution[]> {
    return await this.contributionRepository.find({
      where: { archiveId },
      relations: ['contributor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByContributor(contributorId: string): Promise<ArchiveContribution[]> {
    return await this.contributionRepository.find({
      where: { contributorId },
      relations: ['archive', 'archive.artist'],
      order: { createdAt: 'DESC' },
    });
  }

  async getContributionStatistics(contributorId?: string) {
    const queryBuilder = this.contributionRepository.createQueryBuilder('contribution');

    if (contributorId) {
      queryBuilder.where('contribution.contributorId = :contributorId', { contributorId });
    }

    const stats = await queryBuilder
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN contributionType = \'submission\' THEN 1 END) as submissions',
        'COUNT(CASE WHEN contributionType = \'verification\' THEN 1 END) as verifications',
        'COUNT(CASE WHEN contributionType = \'metadata\' THEN 1 END) as metadata',
        'COUNT(CASE WHEN contributionType = \'digitization\' THEN 1 END) as digitizations',
        'COUNT(CASE WHEN contributionType = \'restoration\' THEN 1 END) as restorations',
      ])
      .getRawOne();

    return stats;
  }
}