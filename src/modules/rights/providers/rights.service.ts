import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Rights, RightsStatus } from '../entities/rights.entity';
import { CreateRightsDto } from '../dto/create-rights.dto';
import { RightsConflictService } from './rights-conflict.service';

@Injectable()
export class RightsService {
  constructor(
    @InjectRepository(Rights)
    private rightsRepository: Repository<Rights>,
    private rightsConflictService: RightsConflictService,
  ) {}

  async create(createRightsDto: CreateRightsDto): Promise<Rights> {
    // Validate ownership percentage doesn't exceed 100% for the same rights type
    await this.validateOwnershipPercentage(createRightsDto);

    const rights = this.rightsRepository.create({
      ...createRightsDto,
      effectiveDate: createRightsDto.effectiveDate ? new Date(createRightsDto.effectiveDate) : new Date(),
      expirationDate: createRightsDto.expirationDate ? new Date(createRightsDto.expirationDate) : undefined,
    });

    const savedRights = await this.rightsRepository.save(rights);

    // Check for conflicts after creation
    await this.rightsConflictService.detectConflicts(savedRights.id);

    return savedRights;
  }

  async findAll(filters?: {
    ownerId?: string;
    trackId?: string;
    albumId?: string;
    rightsType?: string;
    status?: RightsStatus;
  }): Promise<Rights[]> {
    const query = this.rightsRepository.createQueryBuilder('rights')
      .leftJoinAndSelect('rights.owner', 'owner')
      .leftJoinAndSelect('rights.track', 'track')
      .leftJoinAndSelect('rights.album', 'album');

    if (filters?.ownerId) {
      query.andWhere('rights.ownerId = :ownerId', { ownerId: filters.ownerId });
    }

    if (filters?.trackId) {
      query.andWhere('rights.trackId = :trackId', { trackId: filters.trackId });
    }

    if (filters?.albumId) {
      query.andWhere('rights.albumId = :albumId', { albumId: filters.albumId });
    }

    if (filters?.rightsType) {
      query.andWhere('rights.rightsType = :rightsType', { rightsType: filters.rightsType });
    }

    if (filters?.status) {
      query.andWhere('rights.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Rights> {
    const rights = await this.rightsRepository.findOne({
      where: { id },
      relations: ['owner', 'track', 'album', 'transfers', 'conflicts'],
    });

    if (!rights) {
      throw new NotFoundException(`Rights with ID ${id} not found`);
    }

    return rights;
  }

  async update(id: string, updateData: Partial<CreateRightsDto>): Promise<Rights> {
    const rights = await this.findOne(id);

    if (updateData.ownershipPercentage) {
      await this.validateOwnershipPercentage({
        ...updateData,
        trackId: updateData.trackId || rights.trackId,
        albumId: updateData.albumId || rights.albumId,
        rightsType: updateData.rightsType || rights.rightsType,
      } as CreateRightsDto, id);
    }

    Object.assign(rights, {
      ...updateData,
      effectiveDate: updateData.effectiveDate ? new Date(updateData.effectiveDate) : rights.effectiveDate,
      expirationDate: updateData.expirationDate ? new Date(updateData.expirationDate) : rights.expirationDate,
    });

    const updatedRights = await this.rightsRepository.save(rights);

    // Re-check for conflicts after update
    await this.rightsConflictService.detectConflicts(updatedRights.id);

    return updatedRights;
  }

  async remove(id: string): Promise<void> {
    const rights = await this.findOne(id);
    await this.rightsRepository.remove(rights);
  }

  async getRightsOwnership(trackId?: string, albumId?: string): Promise<{
    rightsType: string;
    totalPercentage: number;
    owners: Array<{
      ownerId: string;
      ownerName: string;
      percentage: number;
    }>;
  }[]> {
    const query = this.rightsRepository.createQueryBuilder('rights')
      .leftJoinAndSelect('rights.owner', 'owner')
      .where('rights.status = :status', { status: RightsStatus.ACTIVE });

    if (trackId) {
      query.andWhere('rights.trackId = :trackId', { trackId });
    }

    if (albumId) {
      query.andWhere('rights.albumId = :albumId', { albumId });
    }

    const rights = await query.getMany();

    const ownershipMap = new Map<string, {
      rightsType: string;
      totalPercentage: number;
      owners: Array<{
        ownerId: string;
        ownerName: string;
        percentage: number;
      }>;
    }>();

    rights.forEach(right => {
      const key = right.rightsType;
      
      if (!ownershipMap.has(key)) {
        ownershipMap.set(key, {
          rightsType: right.rightsType,
          totalPercentage: 0,
          owners: [],
        });
      }

      const ownership = ownershipMap.get(key)!;
      ownership.totalPercentage += Number(right.ownershipPercentage);
      ownership.owners.push({
        ownerId: right.ownerId,
        ownerName: right.owner.name || right.owner.email,
        percentage: Number(right.ownershipPercentage),
      });
    });

    return Array.from(ownershipMap.values());
  }

  private async validateOwnershipPercentage(
    createRightsDto: CreateRightsDto,
    excludeRightsId?: string,
  ): Promise<void> {
    const query = this.rightsRepository.createQueryBuilder('rights')
      .where('rights.rightsType = :rightsType', { rightsType: createRightsDto.rightsType })
      .andWhere('rights.status = :status', { status: RightsStatus.ACTIVE });

    if (createRightsDto.trackId) {
      query.andWhere('rights.trackId = :trackId', { trackId: createRightsDto.trackId });
    }

    if (createRightsDto.albumId) {
      query.andWhere('rights.albumId = :albumId', { albumId: createRightsDto.albumId });
    }

    if (excludeRightsId) {
      query.andWhere('rights.id != :excludeId', { excludeId: excludeRightsId });
    }

    const existingRights = await query.getMany();
    const totalExistingPercentage = existingRights.reduce(
      (sum, rights) => sum + Number(rights.ownershipPercentage),
      0,
    );

    const newTotalPercentage = totalExistingPercentage + createRightsDto.ownershipPercentage;

    if (newTotalPercentage > 1) {
      throw new BadRequestException(
        `Total ownership percentage cannot exceed 100%. Current: ${totalExistingPercentage * 100}%, Attempting to add: ${createRightsDto.ownershipPercentage * 100}%`,
      );
    }
  }

  async transferRights(
    rightsId: string,
    transferPercentage: number,
    queryRunner?: QueryRunner,
  ): Promise<Rights> {
    const repository = queryRunner ? queryRunner.manager.getRepository(Rights) : this.rightsRepository;
    
    const rights = await repository.findOne({ where: { id: rightsId } });
    if (!rights) {
      throw new NotFoundException(`Rights with ID ${rightsId} not found`);
    }

    const newPercentage = Number(rights.ownershipPercentage) - transferPercentage;
    if (newPercentage < 0) {
      throw new BadRequestException('Transfer percentage exceeds available ownership');
    }

    rights.ownershipPercentage = newPercentage;
    if (newPercentage === 0) {
      rights.status = RightsStatus.TRANSFERRED;
    }

    return repository.save(rights);
  }
}