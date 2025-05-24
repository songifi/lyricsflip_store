import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('supporters')
@Unique(['supporterId', 'artistId'])
export class Supporter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSupported: number;

  @Column('int', { default: 0 })
  donationCount: number;

  @Column('int', { default: 0 })
  campaignsSupported: number;

  @Column({
    type: 'enum',
    enum: SupporterTier,
    default: SupporterTier.BRONZE,
  })
  tier: SupporterTier;

  @Column('simple-array', { nullable: true })
  badges: string[];

  @Column({ type: 'timestamp', nullable: true })
  firstSupportDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSupportDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isTopSupporter: boolean;

  @Column('json', { nullable: true })
  preferences: {
    receiveUpdates: boolean;
    showInLeaderboard: boolean;
    allowDirectMessages: boolean;
  };

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'supporterId' })
  supporter: User;

  @Column('uuid')
  supporterId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'artistId' })
  artist: User;

  @Column('uuid')
  artistId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}