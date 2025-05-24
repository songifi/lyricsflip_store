import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Band } from './band.entity';
import { User } from './user.entity';
import { CollaborationInvite } from './collaboration-invite.entity';

export enum CollaborationType {
  ALBUM = 'album',
  SINGLE = 'single',
  EP = 'ep',
  LIVE_PERFORMANCE = 'live_performance',
  TOUR = 'tour',
  OTHER = 'other',
}

export enum CollaborationStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CollaborationType,
  })
  type: CollaborationType;

  @Column({
    type: 'enum',
    enum: CollaborationStatus,
    default: CollaborationStatus.PLANNING,
  })
  status: CollaborationStatus;

  @Column({ uuid: true })
  bandId: string;

  @Column({ uuid: true })
  initiatorId: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'json', nullable: true })
  terms: {
    revenueShare?: Record<string, number>;
    responsibilities?: Record<string, string[]>;
    deadlines?: Record<string, Date>;
    budget?: number;
  };

  @ManyToOne(() => Band, (band) => band.collaborations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bandId' })
  band: Band;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @OneToMany(() => CollaborationInvite, (invite) => invite.collaboration, {
    cascade: true,
  })
  invites: CollaborationInvite[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}