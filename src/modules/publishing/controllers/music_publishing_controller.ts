// ============================================================================
// ENUMS
// ============================================================================

// src/publishing/enums/royalty-type.enum.ts
export enum RoyaltyType {
  MECHANICAL = 'mechanical',
  PERFORMANCE = 'performance',
  SYNCHRONIZATION = 'synchronization',
  PRINT = 'print'
}

// src/publishing/enums/usage-type.enum.ts
export enum UsageType {
  PHYSICAL_SALE = 'physical_sale',
  DIGITAL_DOWNLOAD = 'digital_download',
  STREAMING = 'streaming',
  RADIO_BROADCAST = 'radio_broadcast',
  TV_BROADCAST = 'tv_broadcast',
  LIVE_PERFORMANCE = 'live_performance',
  BACKGROUND_MUSIC = 'background_music',
  RINGTONE = 'ringtone',
  SYNC_LICENSE = 'sync_license'
}

// src/publishing/enums/territory.enum.ts
export enum Territory {
  US = 'US',
  UK = 'UK',
  CA = 'CA',
  DE = 'DE',
  FR = 'FR',
  JP = 'JP',
  AU = 'AU',
  WORLDWIDE = 'WORLDWIDE'
}

// src/publishing/enums/rights-society.enum.ts
export enum RightsSocietyType {
  ASCAP = 'ASCAP',
  BMI = 'BMI',
  SESAC = 'SESAC',
  PRS = 'PRS',
  GEMA = 'GEMA',
  SACEM = 'SACEM',
  JASRAC = 'JASRAC',
  APRA = 'APRA'
}

// src/publishing/enums/statement-period.enum.ts
export enum StatementPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual'
}

// ============================================================================
// ENTITIES
// ============================================================================

// src/publishing/entities/song.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PublishingSplit } from './publishing-split.entity';
import { MechanicalRoyalty } from './mechanical-royalty.entity';
import { PerformanceRoyalty } from './performance-royalty.entity';

@Entity('songs')
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  isrc: string;

  @Column({ nullable: true })
  iswc: string;

  @Column({ nullable: true })
  albumTitle: string;

  @Column({ nullable: true })
  artist: string;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => PublishingSplit, split => split.song)
  publishingSplits: PublishingSplit[];

  @OneToMany(() => MechanicalRoyalty, royalty => royalty.song)
  mechanicalRoyalties: MechanicalRoyalty[];

  @OneToMany(() => PerformanceRoyalty, royalty => royalty.song)
  performanceRoyalties: PerformanceRoyalty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/publishing/entities/songwriter.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PublishingSplit } from './publishing-split.entity';

@Entity('songwriters')
export class Songwriter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ default: Territory.US })
  country: Territory;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  bankAccount: string;

  @Column({ nullable: true })
  rightsSociety: RightsSocietyType;

  @Column({ nullable: true })
  rightsSocietyId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => PublishingSplit, split => split.songwriter)
  publishingSplits: PublishingSplit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

// src/publishing/entities/publisher.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PublishingSplit } from './publishing-split.entity';

@Entity('publishers')
export class Publisher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ default: Territory.US })
  country: Territory;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  bankAccount: string;

  @Column({ nullable: true })
  rightsSociety: RightsSocietyType;

  @Column({ nullable: true })
  rightsSocietyId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => PublishingSplit, split => split.publisher)
  publishingSplits: PublishingSplit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/publishing/entities/publishing-split.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Song } from './song.entity';
import { Songwriter } from './songwriter.entity';
import { Publisher } from './publisher.entity';
import { Territory } from '../enums/territory.enum';

@Entity('publishing_splits')
export class PublishingSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  songId: string;

  @Column({ type: 'uuid', nullable: true })
  songwriterId: string;

  @Column({ type: 'uuid', nullable: true })
  publisherId: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  writerSharePercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  publisherSharePercentage: number;

  @Column({ type: 'enum', enum: Territory, default: Territory.WORLDWIDE })
  territory: Territory;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Song, song => song.publishingSplits)
  @JoinColumn({ name: 'songId' })
  song: Song;

  @ManyToOne(() => Songwriter, songwriter => songwriter.publishingSplits)
  @JoinColumn({ name: 'songwriterId' })
  songwriter: Songwriter;

  @ManyToOne(() => Publisher, publisher => publisher.publishingSplits)
  @JoinColumn({ name: 'publisherId' })
  publisher: Publisher;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get totalSharePercentage(): number {
    return Number(this.writerSharePercentage) + Number(this.publisherSharePercentage);
  }
}

// src/publishing/entities/royalty-rate.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RoyaltyType } from '../enums/royalty-type.enum';
import { UsageType } from '../enums/usage-type.enum';
import { Territory } from '../enums/territory.enum';

@Entity('royalty_rates')
export class RoyaltyRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RoyaltyType })
  royaltyType: RoyaltyType;

  @Column({ type: 'enum', enum: UsageType })
  usageType: UsageType;

  @Column({ type: 'enum', enum: Territory })
  territory: Territory;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  rate: number;

  @Column({ nullable: true })
  rateUnit: string; // per unit, per play, per minute, etc.

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/publishing/entities/mechanical-royalty.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Song } from './song.entity';
import { UsageType } from '../enums/usage-type.enum';
import { Territory } from '../enums/territory.enum';

@Entity('mechanical_royalties')
export class MechanicalRoyalty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  songId: string;

  @Column({ type: 'enum', enum: UsageType })
  usageType: UsageType;

  @Column({ type: 'enum', enum: Territory })
  territory: Territory;

  @Column({ type: 'bigint' })
  units: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  ratePerUnit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  commissionRate: number;

  @Column({ type: 'date' })
  usagePeriodStart: Date;

  @Column({ type: 'date' })
  usagePeriodEnd: Date;

  @Column({ nullable: true })
  source: string; // Spotify, Apple Music, Physical, etc.

  @Column({ nullable: true })
  sourceReportId: string;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Song, song => song.mechanicalRoyalties)
  @JoinColumn({ name: 'songId' })
  song: Song;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/publishing/entities/performance-royalty.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Song } from './song.entity';
import { UsageType } from '../enums/usage-type.enum';
import { Territory } from '../enums/territory.enum';
import { RightsSocietyType } from '../enums/rights-society.enum';

@Entity('performance_royalties')
export class PerformanceRoyalty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  songId: string;

  @Column({ type: 'enum', enum: UsageType })
  usageType: UsageType;

  @Column({ type: 'enum', enum: Territory })
  territory: Territory;

  @Column({ type: 'enum', enum: RightsSocietyType })
  rightsSociety: RightsSocietyType;

  @Column({ type: 'bigint' })
  performances: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  ratePerPerformance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  commissionRate: number;

  @Column({ type: 'date' })
  performancePeriodStart: Date;

  @Column({ type: 'date' })
  performancePeriodEnd: Date;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  broadcaster: string;

  @Column({ nullable: true })
  sourceReportId: string;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Song, song => song.performanceRoyalties)
  @JoinColumn({ name: 'songId' })
  song: Song;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/publishing/entities/publishing-statement.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StatementPeriod } from '../enums/statement-period.enum';
import { Territory } from '../enums/territory.enum';

@Entity('publishing_statements')
export class PublishingStatement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  songwriterId: string;

  @Column({ type: 'uuid', nullable: true })
  publisherId: string;

  @Column({ type: 'enum', enum: StatementPeriod })
  period: StatementPeriod;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'enum', enum: Territory })
  territory: Territory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalMechanicalRoyalties: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPerformanceRoyalties: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalSyncRoyalties: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalGrossAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalCommissions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalNetAmount: number;

  @Column({ type: 'jsonb' })
  detailedBreakdown: Record<string, any>;

  @Column({ nullable: true })
  pdfUrl: string;

  @Column({ nullable: true })
  csvUrl: string;

  @Column({ type: 'boolean', default: false })
  isFinalized: boolean;

  @Column({ type: 'boolean', default: false })
  isSent: boolean;

  @Column({ type: 'date', nullable: true })
  sentDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ============================================================================
// INTERFACES
// ============================================================================

// src/publishing/interfaces/royalty-calculation.interface.ts
export interface RoyaltyCalculationResult {
  songId: string;
  songTitle: string;
  totalGross: number;
  totalNet: number;
  totalCommissions: number;
  writerEarnings: number;
  publisherEarnings: number;
  breakdown: RoyaltyBreakdownItem[];
}

export interface RoyaltyBreakdownItem {
  usageType: UsageType;
  territory: Territory;
  units: number;
  rate: number;
  gross: number;
  net: number;
  writerShare: number;
  publisherShare: number;
}

export interface StatementGenerationOptions {
  period: StatementPeriod;
  periodStart: Date;
  periodEnd: Date;
  territory?: Territory;
  includeUnpaid?: boolean;
  format?: 'pdf' | 'csv' | 'excel';
}

// ============================================================================
// DTOS
// ============================================================================

// src/publishing/dto/create-song.dto.ts
import { IsString, IsOptional, IsDateString, IsInt, IsObject } from 'class-validator';

export class CreateSongDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  isrc?: string;

  @IsOptional()
  @IsString()
  iswc?: string;

  @IsOptional()
  @IsString()
  albumTitle?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// src/publishing/dto/create-publishing-split.dto.ts
import { IsUUID, IsNumber, IsEnum, IsDateString, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Territory } from '../enums/territory.enum';

export class CreatePublishingSplitDto {
  @IsUUID()
  songId: string;

  @IsOptional()
  @IsUUID()
  songwriterId?: string;

  @IsOptional()
  @IsUUID()
  publisherId?: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  writerSharePercentage: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  publisherSharePercentage: number;

  @IsEnum(Territory)
  territory: Territory;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

// src/publishing/dto/create-mechanical-royalty.dto.ts
import { IsUUID, IsEnum, IsNumber, IsDateString, IsOptional, IsString, IsObject, IsBoolean } from 'class-validator';
import { UsageType } from '../enums/usage-type.enum';
import { Territory } from '../enums/territory.enum';

export class CreateMechanicalRoyaltyDto {
  @IsUUID()
  songId: string;

  @IsEnum(UsageType)
  usageType: UsageType;

  @IsEnum(Territory)
  territory: Territory;

  @IsNumber()
  units: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  ratePerUnit: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  grossAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  netAmount: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  commissionRate?: number;

  @IsDateString()
  usagePeriodStart: string;

  @IsDateString()
  usagePeriodEnd: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceReportId?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ============================================================================
// SERVICES
// ============================================================================

// src/publishing/services/publishing.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Song } from '../entities/song.entity';
import { Songwriter } from '../entities/songwriter.entity';
import { Publisher } from '../entities/publisher.entity';
import { PublishingSplit } from '../entities/publishing-split.entity';
import { CreateSongDto } from '../dto/create-song.dto';
import { CreatePublishingSplitDto } from '../dto/create-publishing-split.dto';

@Injectable()
export class PublishingService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Songwriter)
    private songwriterRepository: Repository<Songwriter>,
    @InjectRepository(Publisher)
    private publisherRepository: Repository<Publisher>,
    @InjectRepository(PublishingSplit)
    private publishingSplitRepository: Repository<PublishingSplit>,
  ) {}

  async createSong(createSongDto: CreateSongDto): Promise<Song> {
    const song = this.songRepository.create({
      ...createSongDto,
      releaseDate: createSongDto.releaseDate ? new Date(createSongDto.releaseDate) : null,
    });
    return await this.songRepository.save(song);
  }

  async findAllSongs(): Promise<Song[]> {
    return await this.songRepository.find({
      relations: ['publishingSplits', 'publishingSplits.songwriter', 'publishingSplits.publisher'],
    });
  }

  async findSongById(id: string): Promise<Song> {
    const song = await this.songRepository.findOne({
      where: { id },
      relations: ['publishingSplits', 'publishingSplits.songwriter', 'publishingSplits.publisher'],
    });
    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }
    return song;
  }

  async createPublishingSplit(createSplitDto: CreatePublishingSplitDto): Promise<PublishingSplit> {
    // Validate that writer and publisher shares don't exceed 100%
    const totalShare = createSplitDto.writerSharePercentage + createSplitDto.publisherSharePercentage;
    if (totalShare > 1) {
      throw new BadRequestException('Total share percentage cannot exceed 100%');
    }

    // Check if song exists
    const song = await this.songRepository.findOne({ where: { id: createSplitDto.songId } });
    if (!song) {
      throw new BadRequestException('Song not found');
    }

    // Validate existing splits don't exceed 100% when combined
    const existingSplits = await this.publishingSplitRepository.find({
      where: { 
        songId: createSplitDto.songId, 
        territory: createSplitDto.territory,
        isActive: true 
      },
    });

    const existingTotalWriter = existingSplits.reduce((sum, split) => sum + Number(split.writerSharePercentage), 0);
    const existingTotalPublisher = existingSplits.reduce((sum, split) => sum + Number(split.publisherSharePercentage), 0);

    if (existingTotalWriter + createSplitDto.writerSharePercentage > 1) {
      throw new BadRequestException('Total writer share would exceed 100%');
    }

    if (existingTotalPublisher + createSplitDto.publisherSharePercentage > 1) {
      throw new BadRequestException('Total publisher share would exceed 100%');
    }

    const split = this.publishingSplitRepository.create({
      ...createSplitDto,
      effectiveDate: new Date(createSplitDto.effectiveDate),
      endDate: createSplitDto.endDate ? new Date(createSplitDto.endDate) : null,
    });

    return await this.publishingSplitRepository.save(split);
  }

  async getSongSplits(songId: string): Promise<PublishingSplit[]> {
    return await this.publishingSplitRepository.find({
      where: { songId, isActive