// src/entities/user-library.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum LibraryItemType {
  SONG = 'song',
  ALBUM = 'album',
  PLAYLIST = 'playlist',
  ARTIST = 'artist',
  PODCAST = 'podcast',
}

export enum LibraryAction {
  LIKED = 'liked',
  SAVED = 'saved',
  DOWNLOADED = 'downloaded',
  ADDED_TO_PLAYLIST = 'added_to_playlist',
}

@Entity('user_libraries')
@Unique(['userId', 'itemId', 'itemType'])
@Index(['userId', 'itemType'])
@Index(['createdAt'])
export class UserLibrary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  itemId: string; // ID of the song, album, playlist, etc.

  @Column({
    type: 'enum',
    enum: LibraryItemType,
  })
  itemType: LibraryItemType;

  @Column({
    type: 'enum',
    enum: LibraryAction,
    default: LibraryAction.SAVED,
  })
  action: LibraryAction;

  @Column({ nullable: true })
  itemTitle: string;

  @Column({ nullable: true })
  itemArtist: string;

  @Column({ nullable: true })
  itemCover: string;

  @Column({ nullable: true })
  itemDuration: number; // in seconds

  @Column({ nullable: true })
  playlistName: string; // if added to a specific playlist

  @Column({ default: false })
  isDownloaded: boolean;

  @Column({ nullable: true })
  downloadPath: string;

  @Column({ default: 0 })
  playCount: number;

  @Column({ nullable: true })
  lastPlayedAt: Date;

  @Column({ nullable: true })
  rating: number; // 1-5 stars

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.libraries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}