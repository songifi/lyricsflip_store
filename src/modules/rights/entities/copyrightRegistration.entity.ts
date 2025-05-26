import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../music/tracks/entities/track.entity';
import { Album } from '../../music/albums/entities/album.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum RegistrationType {
  SOUND_RECORDING = 'sound_recording',
  MUSICAL_WORK = 'musical_work',
  BOTH = 'both',
}

@Entity('copyright_registrations')
@Index(['registrationNumber'])
@Index(['status'])
export class CopyrightRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  registrationNumber: string;

  @Column({
    type: 'enum',
    enum: RegistrationType,
  })
  registrationType: RegistrationType;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column('uuid')
  applicantId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'applicantId' })
  applicant: User;

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

  @Column()
  workTitle: string;

  @Column({ type: 'text', nullable: true })
  workDescription?: string;

  @Column({ type: 'date' })
  creationDate: Date;

  @Column({ type: 'date' })
  publicationDate: Date;

  @Column({ type: 'date', nullable: true })
  registrationDate?: Date;

  @Column({ type: 'jsonb' })
  authors: Array<{
    name: string;
    role: string;
    birthYear?: number;
    deathYear?: number;
    citizenship?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  claimants?: Array<{
    name: string;
    address: string;
    transferDocument?: string;
  }>;

  @Column({ type: 'text', nullable: true })
  previousRegistrations?: string;

  @Column({ type: 'jsonb', nullable: true })
  depositCopy?: {
    format: string;
    filename: string;
    uploadDate: Date;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  filingFee?: number;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}