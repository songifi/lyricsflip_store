import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity'; // Adjust path as needed
import { ReviewHelpfulnessVote } from './review-helpfulness-vote.entity';
import { ArtistResponse } from './artist-response.entity';

export type ReviewContentType = 'album' | 'track' | 'merchandise' | 'event';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contentId: number;

  @Column({ type: 'enum', enum: ['album', 'track', 'merchandise', 'event'] })
  contentType: ReviewContentType;

  @Column({ type: 'int', width: 1 })
  starRating: number;

  @Column({ type: 'text' })
  reviewText: string;

  @ManyToOne(() => User, user => user.reviews, { eager: true })
  user: User;

  @Column({ default: false })
  verifiedPurchase: boolean;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  moderationStatus: 'pending' | 'approved' | 'rejected';

  @OneToMany(() => ReviewHelpfulnessVote, vote => vote.review, { cascade: true })
  helpfulnessVotes: ReviewHelpfulnessVote[];

  @OneToMany(() => ArtistResponse, response => response.review, { cascade: true })
  artistResponses: ArtistResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
