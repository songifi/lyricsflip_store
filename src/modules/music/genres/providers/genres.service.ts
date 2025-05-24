import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  TreeRepository,
  Like,
  In,
  SelectQueryBuilder,
  MoreThan,
} from 'typeorm';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';
import { GenreQueryDto } from '../dto/genre-query.dto';
import { GenrePopularityHistory } from '../entities/genrePopularityHistory.entity';
import { Genre } from '../entities/genre.entity';
import { GenreResponseDto } from '../dto/genre-response.dto';
import { GenreTreeResponseDto } from '../dto/genreTreeResponse.dto';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: TreeRepository<Genre>,
    @InjectRepository(GenrePopularityHistory)
    private readonly popularityHistoryRepository: Repository<GenrePopularityHistory>,
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<GenreResponseDto> {
    const { parentId, relatedGenreIds, ...genreData } = createGenreDto;
    const slug = this.generateSlug(genreData.name);

    const existingGenre = await this.genreRepository.findOne({ where: { slug } });
    if (existingGenre) {
      throw new ConflictException(`Genre with slug "${slug}" already exists`);
    }

    const genre = this.genreRepository.create({
      ...genreData,
      slug,
    });

    if (parentId) {
      const parent = await this.findOneById(parentId);
      if (!parent) {
        throw new NotFoundException(`Parent genre with ID "${parentId}" not found`);
      }
      genre.parent = parent;
    }

    const savedGenre = await this.genreRepository.save(genre);

    if (relatedGenreIds && relatedGenreIds.length > 0) {
      await this.setRelatedGenres(savedGenre.id, relatedGenreIds);
    }

    return this.mapToResponseDto(savedGenre);
  }

  async findAll(query: GenreQueryDto): Promise<GenreTreeResponseDto> {
    const {
      search,
      isActive,
      isFeatured,
      moods,
      energyLevel,
      maxLevel,
      parentId,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;

    let queryBuilder: SelectQueryBuilder<Genre>;

    if (parentId) {
      const parent = await this.findOneById(parentId);
      queryBuilder = this.genreRepository
        .createDescendantsQueryBuilder('genre', 'genreClosure', parent)
        .leftJoinAndSelect('genre.parent', 'parent')
        .leftJoinAndSelect('genre.children', 'children');
    } else {
      queryBuilder = this.genreRepository
        .createQueryBuilder('genre')
        .leftJoinAndSelect('genre.parent', 'parent')
        .leftJoinAndSelect('genre.children', 'children');
    }

    if (search) {
      queryBuilder.andWhere(
        '(genre.name ILIKE :search OR genre.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('genre.isActive = :isActive', { isActive });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('genre.isFeatured = :isFeatured', { isFeatured });
    }

    if (moods && moods.length > 0) {
      queryBuilder.andWhere('genre.moods && :moods', { moods });
    }

    if (energyLevel !== undefined) {
      queryBuilder.andWhere('genre.energyLevel = :energyLevel', { energyLevel });
    }

    queryBuilder.orderBy(`genre.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const genres = await queryBuilder.getMany();
    const mappedGenres = genres.map(genre => this.mapToResponseDto(genre));

    return {
      genres: mappedGenres,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<GenreResponseDto> {
    const genre = await this.genreRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'relatedGenres'],
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }

    return this.mapToResponseDto(genre);
  }

  async findBySlug(slug: string): Promise<GenreResponseDto> {
    const genre = await this.genreRepository.findOne({
      where: { slug },
      relations: ['parent', 'children', 'relatedGenres'],
    });

    if (!genre) {
      throw new NotFoundException(`Genre with slug "${slug}" not found`);
    }

    return this.mapToResponseDto(genre);
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<GenreResponseDto> {
    const genre = await this.findOneById(id);
    const { parentId, relatedGenreIds, name, ...updateData } = updateGenreDto;

    if (name && name !== genre.name) {
      const newSlug = this.generateSlug(name);
      const existingGenre = await this.genreRepository.findOne({ where: { slug: newSlug } });
      if (existingGenre && existingGenre.id !== id) {
        throw new ConflictException(`Genre with slug "${newSlug}" already exists`);
      }
      updateData['slug'] = newSlug;
      updateData['name'] = name;
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        genre.parent = undefined;
      } else {
        const parent = await this.findOneById(parentId);
        if (await this.wouldCreateCircularReference(id, parentId)) {
          throw new BadRequestException('Cannot create circular reference in genre hierarchy');
        }
        genre.parent = parent;
      }
    }

    Object.assign(genre, updateData);
    const updatedGenre = await this.genreRepository.save(genre);

    if (relatedGenreIds !== undefined) {
      await this.setRelatedGenres(id, relatedGenreIds);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const genre = await this.findOneById(id);
    const children = await this.genreRepository.findDescendants(genre);
    if (children.length > 1) {
      throw new BadRequestException('Cannot delete genre with child genres');
    }

    await this.genreRepository.update(id, { isActive: false });
  }

  async getGenreTree(rootId?: string): Promise<Genre[]> {
    if (rootId) {
      const root = await this.findOneById(rootId);
      if (!root) return [];
      const tree = await this.genreRepository.findDescendantsTree(root);
      return [tree];
    }

    return this.genreRepository.findTrees();
  }

  async getGenreAncestors(id: string): Promise<Genre[]> {
    const genre = await this.findOneById(id);
    return this.genreRepository.findAncestors(genre);
  }

  async getGenreDescendants(id: string): Promise<Genre[]> {
    const genre = await this.findOneById(id);
    return this.genreRepository.findDescendants(genre);
  }

  async updatePopularity(id: string, trackCount: number, streamCount: number): Promise<void> {
    const genre = await this.findOneById(id);
    const popularity = Math.min(100, (trackCount * 0.1) + (streamCount * 0.001));

    await this.genreRepository.update(id, {
      popularity: Math.round(popularity * 100) / 100,
      trackCount,
    });

    await this.popularityHistoryRepository.save({
      genreId: id,
      popularity,
      trackCount,
      streamCount,
      genre,
    });
  }

  async getTrendingGenres(limit: number = 10): Promise<GenreResponseDto[]> {
    const genres = await this.genreRepository.find({
      where: { isActive: true },
      order: { popularity: 'DESC' },
      take: limit,
      relations: ['parent'],
    });

    return genres.map(genre => this.mapToResponseDto(genre));
  }

  async getPopularityHistory(id: string, days: number = 30): Promise<GenrePopularityHistory[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.popularityHistoryRepository.find({
      where: {
        genreId: id,
        recordedAt: MoreThan(since),
      },
      order: { recordedAt: 'ASC' },
    });
  }

  private async findOneById(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) {
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }
    return genre;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async wouldCreateCircularReference(childId: string, parentId: string): Promise<boolean> {
    if (childId === parentId) return true;
    const potentialParent = await this.findOneById(parentId);
    const ancestors = await this.genreRepository.findAncestors(potentialParent);
    return ancestors.some(ancestor => ancestor.id === childId);
  }

  private async setRelatedGenres(genreId: string, relatedGenreIds: string[]): Promise<void> {
    const genre = await this.findOneById(genreId);
    const relatedGenres = await this.genreRepository.findBy({ id: In(relatedGenreIds) });

    if (relatedGenres.length !== relatedGenreIds.length) {
      throw new BadRequestException('Some related genres not found');
    }

    genre.relatedGenres = relatedGenres;
    await this.genreRepository.save(genre);
  }

  private mapToResponseDto(genre: Genre): GenreResponseDto {
    return {
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      description: genre.description,
      parent: genre.parent ? { id: genre.parent.id, name: genre.parent.name } : null,
      isActive: genre.isActive,
      isFeatured: genre.isFeatured,
      energyLevel: genre.energyLevel,
      moods: genre.moods,
      popularity: genre.popularity,
      createdAt: genre.createdAt,
      updatedAt: genre.updatedAt,
      trackCount: genre.trackCount ?? 0,
      albumCount: genre.albumCount ?? 0,
      artistCount: genre.artistCount ?? 0,
      level: genre.level ?? 0,
      fullPath: genre.fullPath ?? '',
    };
  }
}
