import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Album } from './album.entity';
import { ArtworkType } from '../enums/artworkType.enum';

@Entity('album_artwork')
@Index(['album_id', 'artwork_type'])
export class AlbumArtwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ArtworkType,
    default: ArtworkType.COVER,
  })
  artwork_type: ArtworkType;

  @Column({ length: 500 })
  file_url: string;

  @Column({ length: 500, nullable: true })
  thumbnail_url: string;

  @Column({ length: 255, nullable: true })
  filename: string;

  @Column({ length: 50, nullable: true })
  mime_type: string;

  @Column({ type: 'int', nullable: true })
  file_size: number; // in bytes

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'text', nullable: true })
  alt_text: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @ManyToOne(() => Album, (album) => album.artwork, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'album_id' })
  album: Album;

  @Column('uuid')
  album_id: string;

  @CreateDateColumn()
  created_at: Date;
}