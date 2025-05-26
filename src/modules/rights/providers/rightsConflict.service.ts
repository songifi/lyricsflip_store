import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RightsConflict, ConflictType, ConflictStatus, ConflictSeverity } from '../entities/rights-conflict.entity';
import { Rights, RightsStatus } from '../entities/rights.entity';

@Injectable()
export class RightsConflictService {
  constructor(
    @InjectRepository(RightsConflict)
    private conflictRepository: Repository<RightsConflict>,
    @InjectRepository(Rights)
    private rightsRepository: Repository<Rights>,
  ) {}

  async detectConflicts(rightsId: string): Promise<RightsConflict[]> {
    const rights = await this.rightsRepository.findOne({
      where: { id: rightsId },
      relations: ['track', 'album'],
    });

    if (!rights) {
      throw new NotFoundException(`Rights with ID ${rightsId} not found`);
    }

    const conflicts: RightsConflict[] = [];

    // Check for ownership percentage conflicts
    const ownershipConflicts = await this.checkOwnershipPercentageConflicts(rights);
    conflicts.push(...ownershipConflicts);

    // Check for overlapping claims
    const overlappingConflicts = await this.checkOverlappingClaims(rights);
    conflicts.push(...overlappingConflicts);

    // Check for expired rights
    const expiredConflicts = await this.checkExpiredRights(rights);
    conflicts.push(...expiredConflicts);

    // Check for territory conflicts
    const territoryConflicts = await this.checkTerritoryConflicts(rights);
    conflicts.push(...territoryConflicts);

    // Save all detected conflicts
    if (conflicts.length > 0) {
      await this.conflictRepository.save(conflicts);
    }

    return conflicts;
  }

  private async checkOwnershipPercentageConflicts(rights: Rights): Promise<RightsConflict[]> {
    const query = this.rightsRepository.createQueryBuilder('r')
      .where('r.rightsType = :rightsType', { rightsType: rights.rightsType })
      .andWhere('r.status = :status', { status: RightsStatus.ACTIVE })
      .andWhere('r.id != :currentId', { currentId: rights.id });

    if (rights.trackId) {
      query.andWhere('r.trackId = :trackId', { trackId: rights.trackId });
    }

    if (rights.albumId) {
      query.andWhere('r.albumId = :albumId', { albumId: rights.albumId });
    }

    const relatedRights = await query.getMany();
    const totalPercentage = relatedRights.reduce(
      (sum, r) => sum + Number(r.ownershipPercentage),
      Number(rights.ownershipPercentage),
    );

    const conflicts: RightsConflict[] = [];

    if (totalPercentage > 1) {
      const conflict = this.conflictRepository.create({
        rightsId: rights.id,
        conflictType: ConflictType.PERCENTAGE_MISMATCH,
        severity: ConflictSeverity.HIGH,
        description: `Total ownership percentage exceeds 100% (${(totalPercentage * 100).toFixed(2)}%)`,
        conflictingRights: relatedRights.map(r => ({
          rightsId: r.id,
          ownerId: r.ownerId,
          percentage: Number(r.ownershipPercentage),
        })),
      });
      conflicts.push(conflict);
    }

    return conflicts;
  }

  private async checkOverlappingClaims(rights: Rights): Promise<RightsConflict[]> {
    const query = this.rightsRepository.createQueryBuilder('r')
      .where('r.rightsType = :rightsType', { rightsType: rights.rightsType })
      .andWhere('r.ownerId = :ownerId', { ownerId: rights.ownerId })
      .andWhere('r.status = :status', { status: RightsStatus.ACTIVE })
      .andWhere('r.id != :currentId', { currentId: rights.id });

    if (rights.trackId) {
      query.andWhere('r.trackId = :trackId', { trackId: rights.trackId });
    }

    if (rights.albumId) {
      query.andWhere('r.albumId = :albumId', { albumId: rights.albumId });
    }

    const overlappingRights = await query.getMany();
    const conflicts: RightsConflict[] = [];

    if (overlappingRights.length > 0) {
      const conflict = this.conflictRepository.create({
        rightsId: rights.id,
        conflictType: ConflictType.OVERLAPPING_CLAIMS,
        severity: ConflictSeverity.MEDIUM,
        description: `Multiple active rights claims by the same owner for the same content`,
        conflictingRights: overlappingRights.map(r => ({
          rightsId: r.id,
          ownerId: r.ownerId,
          percentage: Number(r.ownershipPercentage),
        })),
      });
      conflicts.push(conflict);
    }

    return conflicts;
  }

  private async checkExpiredRights(rights: Rights): Promise<RightsConflict[]> {
    const conflicts: RightsConflict[] = [];
    const now = new Date();

    if (rights.expirationDate && rights.expirationDate < now && rights.status === RightsStatus.ACTIVE) {
      const conflict = this.conflictRepository.create({
        rightsId: rights.id,
        conflictType: ConflictType.EXPIRED_RIGHTS,
        severity: ConflictSeverity.HIGH,
        description: `Rights have expired but are still marked as active (expired: ${rights.expirationDate.toISOString()})`,
      });
      conflicts.push(conflict);
    }

    return conflicts;
  }

  private async checkTerritoryConflicts(rights: Rights): Promise<RightsConflict[]> {
    // This is a simplified territory conflict check
    // In a real implementation, you'd have more sophisticated territory overlap detection
    const conflicts: RightsConflict[] = [];

    if (rights.territory === 'WORLDWIDE') {
      const query = this.rightsRepository.createQueryBuilder('r')
        .where('r.rightsType = :rightsType', { rightsType: rights.rightsType })
        .andWhere('r.status = :status', { status: RightsStatus.ACTIVE })
        .andWhere('r.id != :currentId', { currentId: rights.id })
        .andWhere('r.territory IS NOT NULL')
        .andWhere('r.territory != :territory', { territory: 'WORLDWIDE' });

      if (rights.trackId) {
        query.andWhere('r.trackId = :trackId', { trackId: rights.trackId });
      }

      if (rights.albumId) {
        query.andWhere('r.albumId = :albumId', { albumId: rights.albumId });
      }

      const conflictingRights = await query.getMany();

      if (conflictingRights.length > 0) {
        const conflict = this.conflictRepository.create({
          rightsId: rights.id,
          conflictType: ConflictType.TERRITORY_CONFLICT,
          severity: ConflictSeverity.MEDIUM,
          description: `Worldwide rights conflict with territory-specific rights`,
          conflictingRights: conflictingRights.map(r => ({
            rightsId: r.id,
            ownerId: r.ownerId,
            percentage: Number(r.ownershipPercentage),
          })),
        });
        conflicts.push(conflict);
      }
    }

    return conflicts;
  }

  async findAll(filters?: {
    rightsId?: string;
    conflictType?: ConflictType;
    status?: ConflictStatus;
    severity?: ConflictSeverity;
    assignedToId?: string;
  }): Promise<RightsConflict[]> {
    const query = this.conflictRepository.createQueryBuilder('conflict')
      .leftJoinAndSelect('conflict.rights', 'rights')
      .leftJoinAndSelect('conflict.reportedBy', 'reportedBy')
      .leftJoinAndSelect('conflict.assignedTo', 'assignedTo');

    if (filters?.rightsId) {
      query.andWhere('conflict.rightsId = :rightsId', { rightsId: filters.rightsId });
    }

    if (filters?.conflictType) {
      query.andWhere('conflict.conflictType = :conflictType', { conflictType: filters.conflictType });
    }

    if (filters?.status) {
      query.andWhere('conflict.status = :status', { status: filters.status });
    }

    if (filters?.severity) {
      query.andWhere('conflict.severity = :severity', { severity: filters.severity });
    }

    if (filters?.assignedToId) {
      query.andWhere('conflict.assignedToId = :assignedToId', { assignedToId: filters.assignedToId });
    }

    return query.orderBy('conflict.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<RightsConflict> {
    const conflict = await this.conflictRepository.findOne({
      where: { id },
      relations: ['rights', 'reportedBy', 'assignedTo'],
    });

    if (!conflict) {
      throw new NotFoundException(`Rights conflict with ID ${id} not found`);
    }

    return conflict;
  }

  async resolve(id: string, resolution: string, resolvedById: string): Promise<RightsConflict> {
    const conflict = await this.findOne(id);

    conflict.status = ConflictStatus.RESOLVED;
    conflict.resolution = resolution;
    conflict.resolvedAt = new Date();
    conflict.assignedToId = resolvedById;

    return this.conflictRepository.save(conflict);
  }

  async assign(id: string, assignedToId: string): Promise<RightsConflict> {
    const conflict = await this.findOne(id);

    conflict.assignedToId = assignedToId;
    conflict.status = ConflictStatus.INVESTIGATING;

    return this.conflictRepository.save(conflict);
  }

  async escalate(id: string, escalatedById: string): Promise<RightsConflict> {
    const conflict = await this.findOne(id);

    conflict.status = ConflictStatus.ESCALATED;
    conflict.severity = ConflictSeverity.CRITICAL;
    conflict.assignedToId = escalatedById;

    return this.conflictRepository.save(conflict);
  }
}