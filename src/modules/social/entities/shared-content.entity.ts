import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../social-feed/post.entity';
import { Track } from '../tracks/track.entity';

export enum SharedContentType {
  URL = 'URL',
  POST = 'POST',
  TRACK = 'TRACK',
}

@Entity()
export class SharedContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sharedContents)
  sharer: User;

  @Column({ type: 'enum', enum: SharedContentType })
  type: SharedContentType;

  @Column({ nullable: true })
  url?: string;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  post?: Post;

  @ManyToOne(() => Track, { nullable: true, onDelete: 'CASCADE' })
  track?: Track;

  @CreateDateColumn()
  sharedAt: Date;
}
