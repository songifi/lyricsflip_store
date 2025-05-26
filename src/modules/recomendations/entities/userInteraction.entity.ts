import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../music/tracks/entities/track.entity';

@Entity('user_interactions')
@Index(['userId', 'trackId'])
@Index(['userId', 'interactionType'])
@Index(['createdAt'])
export class UserInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  trackId: string;

  @Column({
    type: 'enum',
    enum: InteractionType,
  })
  interactionType: InteractionType;

  @Column('float', { default: 1.0 })
  weight: number;

  @Column('int', { nullable: true })
  duration: number; // Duration listened in seconds

  @Column('jsonb', { nullable: true })
  context: Record<string, any>; // Additional context (playlist, device, etc.)

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Track)
  track: Track;
}