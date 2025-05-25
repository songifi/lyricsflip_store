import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Review } from './review.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class ArtistResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Review, review => review.artistResponses, { onDelete: 'CASCADE' })
  review: Review;

  @ManyToOne(() => User, { eager: true }) // Artist user
  artist: User;

  @Column({ type: 'text' })
  responseText: string;

  @CreateDateColumn()
  createdAt: Date;
}
