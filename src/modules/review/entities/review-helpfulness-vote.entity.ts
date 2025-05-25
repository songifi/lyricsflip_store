import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Review } from './review.entity';

@Entity()
@Unique(['review', 'user']) // One vote per user per review
export class ReviewHelpfulnessVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Review, review => review.helpfulnessVotes, { onDelete: 'CASCADE' })
  review: Review;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  isHelpful: boolean;
}
