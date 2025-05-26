import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../music/tracks/entities/track.entity';

@Entity('recommendations')
@Index(['userId', 'isActive'])
@Index(['recommendationType'])
@Index(['score'])
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  trackId: string;

  @Column({
    type: 'enum',
    enum: RecommendationType,
  })
  recommendationType: RecommendationType;

  @Column('float')
  score: number;

  @Column('float', { default: 1.0 })
  confidence: number;

  @Column('jsonb')
  explanation: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('timestamp', { nullable: true })
  viewedAt: Date;

  @Column('timestamp', { nullable: true })
  clickedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Track)
  track: Track;
}