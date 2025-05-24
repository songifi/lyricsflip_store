import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Album } from '../entities/album.entity';
import { AlbumCredit } from '../entities/albumCredit.entity';
import { AlbumArtwork } from '../entities/albumArtwork.entity';
import { CreateAlbumDto } from '../dto/create-album.dto';
import { AlbumQueryDto } from '../dto/albumQuery.dto';
import { UpdateAlbumDto } from '../dto/update-album.dto';
import { AlbumStatus } from '../enums/albumStatus.enum';
import { CreateAlbumCreditDto } from '../dto/createAlbumCredit.dto';
import { CreateAlbumArtworkDto } from '../dto/createAlbumArtwork.dto';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(AlbumCredit)
    private readonly albumCreditRepository: Repository<AlbumCredit>,
    @InjectRepository(AlbumArtwork)
    private readonly albumArtworkRepository: Repository<AlbumArtwork>,
  ) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const slug = this.generateSlug(createAlbumDto.title);
    
    // Check if slug already exists
    const existingAlbum = await this.albumRepository.findOne({
      where: { slug },
    });
    
    if (existingAlbum) {
      throw new ConflictException('Album with this title already exists');
    }

    const album = this.albumRepository.create({
      ...createAlbumDto,
      slug,
    });

    return await this.albumRepository.save(album);
  }

  async findAll(queryDto: AlbumQueryDto) {
    const queryBuilder = this.albumRepository
      .createQueryBuilder('album')
      .leftJoinAndSelect('album.artist', 'artist')
      .leftJoinAndSelect('album.artwork', 'artwork')
      .leftJoinAndSelect('album.credits', 'credits');

    this.applyFilters(queryBuilder, queryDto);
    this.applySorting(queryBuilder, queryDto);

    const [albums, total] = await queryBuilder
      .skip(queryDto.offset)
      .take(queryDto.limit)
      .getManyAndCount();

    return {
      data: albums,
      total,
      limit: queryDto.limit,
      offset: queryDto.offset,
    };
  }

  async findOne(id: string): Promise<Album> {
    const album = await this.albumRepository.findOne({
      where: { id },
      relations: [
        'artist',
        'tracks',
        'credits',
        'artwork',
      ],
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    return album;
  }

  async findBySlug(slug: string): Promise<Album> {
    const album = await this.albumRepository.findOne({
      where: { slug },
      relations: [
        'artist',
        'tracks',
        'credits',
        'artwork',
      ],
    });

    if (!album) {
      throw new NotFoundException(`Album with slug ${slug} not found`);
    }

    return album;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const album = await this.findOne(id);

    // Update slug if title is changed
    if (updateAlbumDto.title && updateAlbumDto.title !== album.title) {
      const newSlug = this.generateSlug(updateAlbumDto.title);
      const existingAlbum = await this.albumRepository.findOne({
        where: { slug: newSlug },
      });
      
      if (existingAlbum && existingAlbum.id !== id) {
        throw new ConflictException('Album with this title already exists');
      }
      
      updateAlbumDto['slug'] = newSlug;
    }

    await this.albumRepository.update(id, updateAlbumDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const album = await this.findOne(id);
    await this.albumRepository.remove(album);
  }

  async updateStatus(id: string, status: AlbumStatus): Promise<Album> {
    await this.albumRepository.update(id, { status });
    return await this.findOne(id);
  }

  async incrementPlayCount(id: string): Promise<void> {
    await this.albumRepository.increment({ id }, 'play_count', 1);
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.albumRepository.increment({ id }, 'download_count', 1);
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.albumRepository.increment({ id }, 'like_count', 1);
  }

  // Album Credits Management
  async addCredit(albumId: string, creditDto: CreateAlbumCreditDto): Promise<AlbumCredit> {
    const album = await this.findOne(albumId);
    
    const credit = this.albumCreditRepository.create({
      ...creditDto,
      album_id: albumId,
    });

    return await this.albumCreditRepository.save(credit);
  }

  async updateCredit(creditId: string, creditDto: Partial<CreateAlbumCreditDto>): Promise<AlbumCredit> {
    const credit = await this.albumCreditRepository.findOne({
      where: { id: creditId },
    });

    if (!credit) {
      throw new NotFoundException(`Credit with ID ${creditId} not found`);
    }

    await this.albumCreditRepository.update(creditId, creditDto);
    const updatedCredit = await this.albumCreditRepository.findOne({
      where: { id: creditId },
    });
    if (!updatedCredit) {
      throw new NotFoundException(`Credit with ID ${creditId} not found`);
    }
    return updatedCredit;
  }

  async removeCredit(creditId: string): Promise<void> {
    const credit = await this.albumCreditRepository.findOne({
      where: { id: creditId },
    });

    if (!credit) {
      throw new NotFoundException(`Credit with ID ${creditId} not found`);
    }

    await this.albumCreditRepository.remove(credit);
  }

  async getCredits(albumId: string): Promise<AlbumCredit[]> {
    return await this.albumCreditRepository.find({
      where: { album_id: albumId },
      order: { order_index: 'ASC' },
    });
  }

  // Album Artwork Management
  async addArtwork(albumId: string, artworkDto: CreateAlbumArtworkDto): Promise<AlbumArtwork> {
    const album = await this.findOne(albumId);

    // If this is being set as primary, remove primary from others
    if (artworkDto.is_primary) {
      await this.albumArtworkRepository.update(
        { album_id: albumId },
        { is_primary: false }
      );
    }

    const artwork = this.albumArtworkRepository.create({
      ...artworkDto,
      album_id: albumId,
    });

    return await this.albumArtworkRepository.save(artwork);
  }

  async updateArtwork(artworkId: string, artworkDto: Partial<CreateAlbumArtworkDto>): Promise<AlbumArtwork> {
    const artwork = await this.albumArtworkRepository.findOne({
      where: { id: artworkId },
    });

    if (!artwork) {
      throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
    }

    // If this is being set as primary, remove primary from others
    if (artworkDto.is_primary) {
      await this.albumArtworkRepository.update(
        { album_id: artwork.album_id },
        { is_primary: false }
      );
    }

    await this.albumArtworkRepository.update(artworkId, artworkDto);
    const updatedArtwork = await this.albumArtworkRepository.findOne({
      where: { id: artworkId },
    });
    if (!updatedArtwork) {
      throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
    }
    return updatedArtwork;
  }

  async removeArtwork(artworkId: string): Promise<void> {
    const artwork = await this.albumArtworkRepository.findOne({
      where: { id: artworkId },
    });

    if (!artwork) {
      throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
    }

    await this.albumArtworkRepository.remove(artwork);
  }

  async getArtwork(albumId: string): Promise<AlbumArtwork[]> {
    return await this.albumArtworkRepository.find({
      where: { album_id: albumId },
      order: { order_index: 'ASC', created_at: 'DESC' },
    });
  }

  async getPrimaryArtwork(albumId: string): Promise<AlbumArtwork> {
    const artwork = await this.albumArtworkRepository.findOne({
      where: { album_id: albumId, is_primary: true },
    });
    if (!artwork) {
      throw new NotFoundException(`Primary artwork for album ${albumId} not found`);
    }
    return artwork;
  }

  // Search and Discovery
  async searchAlbums(query: string, limit: number = 20): Promise<Album[]> {
    return await this.albumRepository
      .createQueryBuilder('album')
      .leftJoinAndSelect('album.artist', 'artist')
      .leftJoinAndSelect('album.artwork', 'artwork')
      .where('album.title ILIKE :query', { query: `%${query}%` })
      .orWhere('album.description ILIKE :query', { query: `%${query}%` })
      .orWhere('album.keywords && :keywords', { keywords: [query] })
      .orWhere('artist.name ILIKE :query', { query: `%${query}%` })
      .andWhere('album.is_active = :active', { active: true })
      .andWhere('album.status = :status', { status: AlbumStatus.RELEASED })
      .orderBy('album.play_count', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getPopularAlbums(limit: number = 20): Promise<Album[]> {
    return await this.albumRepository.find({
      where: {
        is_active: true,
        status: AlbumStatus.RELEASED,
      },
      relations: ['artist', 'artwork'],
      order: {
        play_count: 'DESC',
        created_at: 'DESC',
      },
      take: limit,
    });
  }

  async getRecentReleases(limit: number = 20): Promise<Album[]> {
    return await this.albumRepository.find({
      where: {
        is_active: true,
        status: AlbumStatus.RELEASED,
      },
      relations: ['artist', 'artwork'],
      order: {
        release_date: 'DESC',
        created_at: 'DESC',
      },
      take: limit,
    });
  }

  async getUpcomingReleases(limit: number = 20): Promise<Album[]> {
    const today = new Date();
    
    return await this.albumRepository
      .createQueryBuilder('album')
      .leftJoinAndSelect('album.artist', 'artist')
      .leftJoinAndSelect('album.artwork', 'artwork')
      .where('album.release_date > :today', { today })
      .andWhere('album.is_active = :active', { active: true })
      .andWhere('album.status = :status', { status: AlbumStatus.SCHEDULED })
      .orderBy('album.release_date', 'ASC')
      .limit(limit)
      .getMany();
  }

  // Private helper methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<Album>, queryDto: AlbumQueryDto): void {
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(album.title ILIKE :search OR album.description ILIKE :search OR artist.name ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    if (queryDto.artist_id) {
      queryBuilder.andWhere('album.artist_id = :artistId', { artistId: queryDto.artist_id });
    }

    if (queryDto.album_type) {
      queryBuilder.andWhere('album.album_type = :albumType', { albumType: queryDto.album_type });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('album.status = :status', { status: queryDto.status });
    }

    if (queryDto.genre) {
      queryBuilder.andWhere(':genre = ANY(album.genres)', { genre: queryDto.genre });
    }

    if (queryDto.record_label) {
      queryBuilder.andWhere('album.record_label = :recordLabel', { recordLabel: queryDto.record_label });
    }

    if (queryDto.is_explicit !== undefined) {
      queryBuilder.andWhere('album.is_explicit = :isExplicit', { isExplicit: queryDto.is_explicit });
    }

    if (queryDto.is_active !== undefined) {
      queryBuilder.andWhere('album.is_active = :isActive', { isActive: queryDto.is_active });
    }
  }

  private applySorting(queryBuilder: SelectQueryBuilder<Album>, queryDto: AlbumQueryDto): void {
    const sortBy = queryDto.sort_by || 'created_at';
    const sortOrder = queryDto.sort_order || 'DESC';

    switch (sortBy) {
      case 'title':
        queryBuilder.orderBy('album.title', sortOrder);
        break;
      case 'release_date':
        queryBuilder.orderBy('album.release_date', sortOrder);
        break;
      case 'play_count':
        queryBuilder.orderBy('album.play_count', sortOrder);
        break;
      case 'artist':
        queryBuilder.orderBy('artist.name', sortOrder);
        break;
      default:
        queryBuilder.orderBy('album.created_at', sortOrder);
    }
  }
}