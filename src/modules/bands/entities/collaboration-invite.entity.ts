import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Collaboration } from './collaboration.entity';
import { User } from './user.entity';
import { Band } from './band.entity';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Entity('collaboration_invites')
export class CollaborationInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  collaborationId: string;

  @Column({ uuid: true, nullable: true })
  invitedUserId: string;

  @Column({ uuid: true, nullable: true })
  invitedBandId: string;

  @Column({ uuid: true })
  invitedById: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  proposedTerms: {
    role?: string;
    revenueShare?: number;
    responsibilities?: string[];
  };

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date;

  @ManyToOne(() => Collaboration, (collaboration) => collaboration.invites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collaborationId' })
  collaboration: Collaboration;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invitedUserId' })
  invitedUser: User;

  @ManyToOne(() => Band, { nullable: true })
  @JoinColumn({ name: 'invitedBandId' })
  invitedBand: Band;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitedById' })
  invitedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}