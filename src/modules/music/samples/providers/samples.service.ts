import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Sample, SampleStatus, SampleType } from '../entities/sample.entity';
import { SampleTag, TagCategory } from '../entities/sample-tag.entity';
import { SampleUsage, UsageType, UsageContext } from '../entities/sample-usage.entity';
import { CreateSampleDto, UpdateSampleDto, SampleQueryDto } from '../dto/create-sample.dto';

@Injectable()
export class SamplesService {
  constructor(
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
    @InjectRepository(SampleTag)
    private readonly tagRepository: Repository<SampleTag>,
    @InjectRepository(SampleUsage)
    private readonly usageRepository: Repository<SampleUsage>,
  ) {}

  async create(createSampleDto: CreateSampleDto, creatorId: string): Promise<Sample> {
    const { tags, genreIds, ...sampleData } = createSampleDto;

    // Create or find tags
    const sampleTags = await this.findOrCreateTags(tags || []);

    const sample = this.sampleRepository.create({
      ...sampleData,
      creatorId,
      tags: sampleTags,
    });

    const savedSample = await this.sampleRepository.save(sample);

    // Load relations for response
    return this.findOne(savedSample.id);
  }

  async findAll(query: SampleQueryDto): Promise<{ samples: Sample[]; total: number }> {
    const {
      search,
      type,
      genreIds,
      tags,
      key,
      minBpm,
      maxBpm,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      creatorId,
      artistId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.sampleRepository
      .createQueryBuilder('sample')
      .leftJoinAndSelect('sample.creator', 'creator')
      .leftJoinAndSelect('sample.artist', 'artist')
      .leftJoinAndSelect('sample.genres', 'genres')
      .leftJoinAndSelect('sample.tags', 'tags')
      .where('sample.status = :status', { status: SampleStatus.APPROVED });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(sample.title ILIKE :search OR sample.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('sample.type = :type', { type });
    }

    if (genreIds?.length) {
      queryBuilder.andWhere('genres.id IN (:...genreIds)', { genreIds });
    }

    if (tags?.length) {
      queryBuilder.andWhere('tags.name IN (:...tags)', { tags });
    }

    if (key) {
      queryBuilder.andWhere('sample.key = :key', { key });
    }

    if (minBpm !== undefined) {
      queryBuilder.andWhere('sample.bpm >= :minBpm', { minBpm });
    }

    if (maxBpm !== undefined) {
      queryBuilder.andWhere('sample.bpm <= :maxBpm', { maxBpm });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('sample.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('sample.price <= :maxPrice', { maxPrice });
    }

    if (minDuration !== undefined) {
      queryBuilder.andWhere('sample.duration >= :minDuration', { minDuration });
    }

    if (maxDuration !== undefined) {
      queryBuilder.andWhere('sample.duration <= :maxDuration', { maxDuration });
    }

    if (creatorId) {
      queryBuilder.andWhere('sample.creatorId = :creatorId', { creatorId });
    }

    if (artistId) {
      queryBuilder.andWhere('sample.artistId = :artistId', { artistId });
    }

    // Apply sorting
    queryBuilder.orderBy(`sample.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [samples, total] = await queryBuilder.getManyAndCount();

    return { samples, total };
  }

  async findOne(id: string): Promise<Sample> {
    const sample = await this.sampleRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'artist',
        'genres',
        'tags',
        'licenses',
        'samplePacks',
      ],
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    return sample;
  }

  async update(
    id: string,
    updateSampleDto: UpdateSampleDto,
    userId: string,
  ): Promise<Sample> {
    const sample = await this.findOne(id);

    if (sample.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own samples');
    }

    const { tags, genreIds, ...updateData } = updateSampleDto;

    // Update tags if provided
    if (tags) {
      const sampleTags = await this.findOrCreateTags(tags);
      sample.tags = sampleTags;
    }

    Object.assign(sample, updateData);

    return this.sampleRepository.save(sample);
  }

  async remove(id: string, userId: string): Promise<void> {
    const sample = await this.findOne(id);

    if (sample.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own samples');
    }

    await this.sampleRepository.remove(sample);
  }

  async trackUsage(
    sampleId: string,
    type: UsageType,
    context?: UsageContext,
    userId?: string,
    metadata?: any,
  ): Promise<void> {
    const sample = await this.sampleRepository.findOne({
      where: { id: sampleId },
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    // Create usage record
    const usage = this.usageRepository.create({
      sampleId,
      type,
      context,
      userId,
      metadata,
    });

    await this.usageRepository.save(usage);

    // Update sample counters
    switch (type) {
      case UsageType.PREVIEW:
      case UsageType.STREAM:
        sample.playCount += 1;
        break;
      case UsageType.DOWNLOAD:
        sample.downloadCount += 1;
        break;
    }

    await this.sampleRepository.save(sample);
  }

  async getPreviewUrl(id: string, userId?: string): Promise<string> {
    const sample = await this.findOne(id);

    if (!sample.isAvailableForLicensing) {
      throw new BadRequestException('Sample is not available');
    }

    // Track preview usage
    await this.trackUsage(
      id,
      UsageType.PREVIEW,
      UsageContext.WEB_PLAYER,
      userId,
    );

    return sample.previewUrl || sample.fileUrl;
  }

  async getDownloadUrl(id: string, userId: string): Promise<string> {
    const sample = await this.findOne(id);

    // Check if user has license or owns the sample
    const hasAccess = await this.checkDownloadAccess(id, userId);

    if (!hasAccess) {
      throw new ForbiddenException('You need a license to download this sample');
    }

    // Track download usage
    await this.trackUsage(
      id,
      UsageType.DOWNLOAD,
      UsageContext.DIRECT_LINK,
      userId,
    );

    return sample.fileUrl;
  }

  async getSampleAnalytics(sampleId: string, creatorId: string) {
    const sample = await this.findOne(sampleId);

    if (sample.creatorId !== creatorId) {
      throw new ForbiddenException('You can only view analytics for your own samples');
    }

    const usageStats = await this.usageRepository
      .createQueryBuilder('usage')
      .select('usage.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('usage.sampleId = :sampleId', { sampleId })
      .groupBy('usage.type')
      .getRawMany();

    const dailyStats = await this.usageRepository
      .createQueryBuilder('usage')
      .select('DATE(usage.createdAt)', 'date')
      .addSelect('usage.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('usage.sampleId = :sampleId', { sampleId })
      .andWhere('usage.createdAt >= :startDate', {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      })
      .groupBy('DATE(usage.createdAt), usage.type')
      .orderBy('date', 'DESC')
      .getRawMany();

    return {
      sample,
      usageStats,
      dailyStats,
      totalRevenue: 0, // Calculate from purchases/licenses
      totalPlays: sample.playCount,
      totalDownloads: sample.downloadCount,
    };
  }

  private async findOrCreateTags(tagNames: string[]): Promise<SampleTag[]> {
    const tags: SampleTag[] = [];

    for (const tagName of tagNames) {
      let tag = await this.tagRepository.findOne({
        where: { name: tagName.toLowerCase() },
      });

      if (!tag) {
        tag = this.tagRepository.create({
          name: tagName.toLowerCase(),
          category: TagCategory.CUSTOM,
        });
        tag = await this.tagRepository.save(tag);
      }

      tag.usageCount += 1;
      await this.tagRepository.save(tag);
      tags.push(tag);
    }

    return tags;
  }

  private async checkDownloadAccess(sampleId: string, userId: string): Promise<boolean> {
    const sample = await this.sampleRepository.findOne({
      where: { id: sampleId },
      relations: ['licenses'],
    });

    if (!sample) {
      return false;
    }

    // Owner can always download
    if (sample.creatorId === userId) {
      return true;
    }

    // Check if user has active license
    const hasLicense = sample.licenses.some(
      (license) => license.licenseeId === userId && license.isActive,
    );

    return hasLicense;
  }
}