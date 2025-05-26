import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Archive, ArchiveStatus } from '../entities/archive.entity';
import { ArchiveContribution } from '../entities/archive-contribution.entity';
import { ArchiveMilestone } from '../entities/archive-milestone.entity';
import { CreateArchiveDto } from '../dto/create-archive.dto';
import { UpdateArchiveDto } from '../dto/update-archive.dto';
import { SearchArchiveDto } from '../dto/search-archive.dto';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(Archive)
    private archiveRepository: Repository<Archive>,
    @InjectRepository(ArchiveContribution)
    private contributionRepository: Repository<ArchiveContribution>,
    @InjectRepository(ArchiveMilestone)
    private milestoneRepository: Repository<ArchiveMilestone>,
  ) {}

  async create(createArchiveDto: CreateArchiveDto, contributorId: string): Promise<Archive> {
    const archive = this.archiveRepository.create({
      ...createArchiveDto,
      contributorId,
      status: ArchiveStatus.PENDING,
    });

    return await this.archiveRepository.save(archive);
  }

  async findAll(searchDto: SearchArchiveDto) {
    const {
      query,
      archiveType,
      status,
      preservationQuality,
      artistId,
      era,
      genre,
      fromDate,
      toDate,
      isPubliclyAccessible,
      recordingLocation,
      producer,
      recordingStudio,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const queryBuilder = this.archiveRepository
      .createQueryBuilder('archive')
      .leftJoinAndSelect('archive.artist', 'artist')
      .leftJoinAndSelect('archive.track', 'track')
      .leftJoinAndSelect('archive.album', 'album')
      .leftJoinAndSelect('archive.contributor', 'contributor')
      .leftJoinAndSelect('archive.milestones', 'milestones');

    // Text search across multiple fields
    if (query) {
      queryBuilder.andWhere(
        `(
          archive.title ILIKE :query OR 
          archive.description ILIKE :query OR
          artist.name ILIKE :query OR
          track.title ILIKE :query OR
          album.title ILIKE :query OR
          archive.historicalMetadata::text ILIKE :query
        )`,
        { query: `%${query}%` }
      );
    }

    // Filter by archive type
    if (archiveType) {
      queryBuilder.andWhere('archive.archiveType = :archiveType', { archiveType });
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('archive.status = :status', { status });
    }

    // Filter by preservation quality
    if (preservationQuality) {
      queryBuilder.andWhere('archive.preservationQuality = :preservationQuality', { preservationQuality });
    }

    // Filter by artist
    if (artistId) {
      queryBuilder.andWhere('archive.artistId = :artistId', { artistId });
    }

    // Filter by era
    if (era) {
      queryBuilder.andWhere("archive.historicalMetadata->>'era' = :era", { era });
    }

    // Filter by recording location
    if (recordingLocation) {
      queryBuilder.andWhere("archive.historicalMetadata->>'recordingLocation' ILIKE :recordingLocation", {
        recordingLocation: `%${recordingLocation}%`,
      });
    }

    // Filter by producer
    if (producer) {
      queryBuilder.andWhere("archive.historicalMetadata->>'producer' ILIKE :producer", {
        producer: `%${producer}%`,
      });
    }

    // Filter by recording studio
    if (recordingStudio) {
      queryBuilder.andWhere("archive.historicalMetadata->>'recordingStudio' ILIKE :recordingStudio", {
        recordingStudio: `%${recordingStudio}%`,
      });
    }

    // Filter by date range
    if (fromDate) {
      queryBuilder.andWhere('archive.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('archive.createdAt <= :toDate', { toDate });
    }

    // Filter by public accessibility
    if (isPubliclyAccessible !== undefined) {
      queryBuilder.andWhere('archive.isPubliclyAccessible = :isPubliclyAccessible', { isPubliclyAccessible });
    }

    // Sorting
    const validSortFields = ['createdAt', 'title', 'status', 'preservationQuality'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`archive.${sortField}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [archives, total] = await queryBuilder.getManyAndCount();

    return {
      data: archives,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Archive> {
    const archive = await this.archiveRepository.findOne({
      where: { id },
      relations: [
        'artist',
        'track',
        'album',
        'contributor',
        'contributions',
        'contributions.contributor',
        'milestones',
      ],
    });

    if (!archive) {
      throw new NotFoundException(`Archive with ID ${id} not found`);
    }

    return archive;
  }

  async update(id: string, updateArchiveDto: UpdateArchiveDto): Promise<Archive> {
    const archive = await this.findOne(id);
    
    Object.assign(archive, updateArchiveDto);
    
    return await this.archiveRepository.save(archive);
  }

  async remove(id: string): Promise<void> {
    const archive = await this.findOne(id);
    await this.archiveRepository.remove(archive);
  }

  async updateStatus(id: string, status: ArchiveStatus): Promise<Archive> {
    const archive = await this.findOne(id);
    archive.status = status;
    return await this.archiveRepository.save(archive);
  }

  async getArchivesByArtist(artistId: string): Promise<Archive[]> {
    return await this.archiveRepository.find({
      where: { artistId },
      relations: ['track', 'album', 'milestones'],
      order: { createdAt: 'DESC' },
    });
  }

  async getArchiveTimeline(artistId: string) {
    const archives = await this.archiveRepository
      .createQueryBuilder('archive')
      .leftJoinAndSelect('archive.milestones', 'milestones')
      .leftJoinAndSelect('archive.track', 'track')
      .leftJoinAndSelect('archive.album', 'album')
      .where('archive.artistId = :artistId', { artistId })
      .orderBy('milestones.milestoneDate', 'ASC')
      .getMany();

    // Create timeline from milestones
    const timeline = [];
    
    for (const archive of archives) {
      for (const milestone of archive.milestones) {
        timeline.push({
          date: milestone.milestoneDate,
          type: milestone.milestoneType,
          title: milestone.title,
          description: milestone.description,
          location: milestone.location,
          archive: {
            id: archive.id,
            title: archive.title,
            archiveType: archive.archiveType,
          },
          additionalData: milestone.additionalData,
        });
      }
    }

    return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async searchByMetadata(metadata: Record<string, any>) {
    const queryBuilder = this.archiveRepository
      .createQueryBuilder('archive')
      .leftJoinAndSelect('archive.artist', 'artist');

    Object.entries(metadata).forEach(([key, value], index) => {
      queryBuilder.andWhere(`archive.historicalMetadata->>'${key}' ILIKE :value${index}`, {
        [`value${index}`]: `%${value}%`,
      });
    });

    return await queryBuilder.getMany();
  }

  async getPreservationStatistics() {
    const stats = await this.archiveRepository
      .createQueryBuilder('archive')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN status = \'archived\' THEN 1 END) as archived',
        'COUNT(CASE WHEN status = \'verified\' THEN 1 END) as verified',
        'COUNT(CASE WHEN archiveType = \'music\' THEN 1 END) as music',
        'COUNT(CASE WHEN archiveType = \'document\' THEN 1 END) as documents',
        'COUNT(CASE WHEN archiveType = \'photo\' THEN 1 END) as photos',
        'COUNT(CASE WHEN archiveType = \'video\' THEN 1 END) as videos',
        'COUNT(CASE WHEN preservationQuality = \'master\' THEN 1 END) as masterQuality',
        'COUNT(CASE WHEN isPubliclyAccessible = true THEN 1 END) as publiclyAccessible',
      ])
      .getRawOne();

    return stats;
  }
}