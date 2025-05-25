import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  POST_CREATED = 'POST_CREATED',
  COMMENTED = 'COMMENTED',
  TRACK_LIKED = 'TRACK_LIKED',
  FOLLOWED_ARTIST = 'FOLLOWED_ARTIST',
  JOINED_FANCLUB = 'JOINED_FANCLUB',
  CHALLENGE_PARTICIPATED = 'CHALLENGE_PARTICIPATED',
}

@Entity()
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.activities, { eager: true })
  user: User;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column({ type: 'jsonb', nullable: true })
  payload: any; // additional info about activity

  @CreateDateColumn()
  createdAt: Date;
}
