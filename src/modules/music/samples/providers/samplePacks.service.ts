import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SamplePack, PackStatus } from '../entities/sample-pack.entity';
import { Sample, SampleStatus } from '../entities/sample.entity';
import { CreateSamplePackDto, UpdateSamplePackDto } from '../dto/create-sample-pack.dto';

@Injectable()
export class SamplePacksService {
  constructor(
    @InjectRepository(SamplePack)
    private readonly packRepository: Repository<SamplePack>,
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
  ) {}

  async create(createPackDto: CreateSamplePackDto, creatorId: string): Promise<SamplePack> {
    const { sampleIds, genreIds, ...packData } = createPackDto;

    // Validate samples exist and belong to creator
    const samples = await this.sampleRepository.find({
      where: {
        id: In(sampleIds),
        creatorId,
        status: SampleStatus.APPROVED,
      },
    });

    if (samples.length !== sampleIds.length) {
      throw new BadRequestException('Some samples not found or not owned by you');
    }

    const pack = this.packRepository.create({
      ...packData,
      creatorId,
      samples,
    });

    const savedPack = await this.packRepository.save(pack);
    return this.findOne(savedPack.id);
  }

  async findAll(creatorId?: string): Promise<SamplePack[]> {
    const queryBuilder = this.packRepository
      .createQueryBuilder('pack')
      .leftJoinAndSelect('pack.creator', 'creator')
      .leftJoinAndSelect('pack.artist', 'artist')
      .leftJoinAndSelect('pack.samples', 'samples')
      .leftJoinAndSelect('pack.genres', 'genres')
      .where('pack.status = :status', { status: PackStatus.PUBLISHED });

    if (creatorId) {
      queryBuilder.andWhere('pack.creatorId = :creatorId', { creatorId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<SamplePack> {
    const pack = await this.packRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'artist',
        'samples',
        'samples.tags',
        'samples.genres',
        'genres',
      ],
    });

    if (!pack) {
      throw new NotFoundException('Sample pack not found');
    }

    return pack;
  }

  async update(
    id: string,
    updatePackDto: UpdateSamplePackDto,
    userId: string,
  ): Promise<SamplePack> {
    const pack = await this.findOne(id);

    if (pack.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own sample packs');
    }

    const { sampleIds, genreIds, ...updateData } = updatePackDto;

    // Update samples if provided
    if (sampleIds) {
      const samples = await this.sampleRepository.find({
        where: {
          id: In(sampleIds),
          creatorId: userId,
          status: SampleStatus.APPROVED,
        },
      });

      if (samples.length !== sampleIds.length) {
        throw new BadRequestException('Some samples not found or not owned by you');
      }

      pack.samples = samples;
    }

    Object.assign(pack, updateData);
    return this.packRepository.save(pack);
  }

  async remove(id: string, userId: string): Promise<void> {
    const pack = await this.findOne(id);

    if (pack.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own sample packs');
    }

    await this.packRepository.remove(pack);
  }

  async publish(id: string, userId: string): Promise<SamplePack> {
    const pack = await this.findOne(id);

    if (pack.creatorId !== userId) {
      throw new ForbiddenException('You can only publish your own sample packs');
    }

    if (pack.samples.length === 0) {
      throw new BadRequestException('Cannot publish empty sample pack');
    }

    pack.status = PackStatus.PUBLISHED;
    return this.packRepository.save(pack);
  }

  async calculatePackValue(id: string): Promise<{
    individualTotal: number;
    packPrice: number;
    savings: number;
    savingsPercentage: number;
  }> {
    const pack = await this.findOne(id);

    const individualTotal = pack.samples.reduce(
      (total, sample) => total + sample.effectivePrice,
      0,
    );

    const packPrice = pack.finalPrice;
    const savings = individualTotal - packPrice;
    const savingsPercentage = (savings / individualTotal) * 100;

    return {
      individualTotal,
      packPrice,
      savings,
      savingsPercentage,
    };
  }

  async getPackAnalytics(packId: string, creatorId: string) {
    const pack = await this.findOne(packId);

    if (pack.creatorId !== creatorId) {
      throw new ForbiddenException('You can only view analytics for your own packs');
    }

    const packValue = await this.calculatePackValue(packId);

    return {
      pack,
      packValue,
      totalSamples: pack.samples.length,
      totalDownloads: pack.downloadCount,
      totalViews: pack.viewCount,
      conversionRate: pack.viewCount > 0 ? (pack.downloadCount / pack.viewCount) * 100 : 0,
    };
  }
}