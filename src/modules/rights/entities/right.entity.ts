import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../music/tracks/entities/track.entity';
import { Album } from '../../music/albums/entities/album.entity';
import { RightsTransfer } from './rights-transfer.entity';
import { RightsConflict } from './rights-conflict.entity';

export enum RightsType {
  MASTER = 'master',
  PUBLISHING = 'publishing',
  MECHANICAL = 'mechanical',
  PERFORMANCE = 'performance',
  SYNCHRONIZATION = 'synchronization',
  DIGITAL = 'digital',
  NEIGHBORING = 'neighboring',
}

export enum OwnershipType {
  FULL = 'full',
  PARTIAL = 'partial',
  EXCLUSIVE = 'exclusive',
  NON_EXCLUSIVE = 'non_exclusive',
}

export enum RightsStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  DISPUTED = 'disputed',
  TRANSFERRED = 'transferred',
}

@Entity('rights')
@Index(['trackId', 'rightsType'])
@Index(['ownerId', 'rightsType'])
@Index(['status'])
export class Rights {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RightsType,
  })
  rightsType: RightsType;

  @Column({
    type: 'enum',
    enum: OwnershipType,
  })
  ownershipType: OwnershipType;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 1.0,
  })
  ownershipPercentage: number;

  @Column({
    type: 'enum',
    enum: RightsStatus,
    default: RightsStatus.ACTIVE,
  })
  status: RightsStatus;

  @Column('uuid')
  ownerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column('uuid', { nullable: true })
  trackId?: string;

  @ManyToOne(() => Track, { nullable: true })
  @JoinColumn({ name: 'trackId' })
  track?: Track;

  @Column('uuid', { nullable: true })
  albumId?: string;

  @ManyToOne(() => Album, { nullable: true })
  @JoinColumn({ name: 'albumId' })
  album?: Album;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ type: 'text', nullable: true })
  territory?: string;

  @Column({ type: 'jsonb', nullable: true })
  restrictions?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', nullable: true })
  registrationNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  isrcCode?: string;

  @Column({ type: 'varchar', nullable: true })
  iswcCode?: string;

  @OneToMany(() => RightsTransfer, (transfer) => transfer.rights)
  transfers: RightsTransfer[];

  @OneToMany(() => RightsConflict, (conflict) => conflict.rights)
  conflicts: RightsConflict[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}