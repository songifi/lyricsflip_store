import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Recommendation } from './recommendation.entity';

@Entity('recommendation_feedback')
export class RecommendationFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  recommendationId: string;

  @Column({
    type: 'enum',
    enum: FeedbackType,
  })
  feedbackType: FeedbackType;

  @Column('text', { nullable: true })
  comment: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Recommendation)
  recommendation: Recommendation;
}