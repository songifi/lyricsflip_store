import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
// import { Track } from './track.entity';
import { AlbumType } from '../enums/albumType.enum';
import { AlbumStatus } from '../enums/albumStatus.enum';
import { AlbumGenre } from '../enums/albumGenre.enum';
import { AlbumCredit } from './albumCredit.entity';
import { AlbumArtwork } from './albumArtwork.entity';
import { Artist } from 'src/modules/artists/entities/artist.entity';


@Entity('albums')
@Index(['title', 'artist_id'])
@Index(['release_date'])
@Index(['status'])
@Index(['album_type'])
@Index(['slug'])
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  title: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AlbumType,
    default: AlbumType.LP,
  })
  album_type: AlbumType;

  @Column({
    type: 'enum',
    enum: AlbumStatus,
    default: AlbumStatus.DRAFT,
  })
  status: AlbumStatus;

  @Column({
    type: 'enum',
    enum: AlbumGenre,
    array: true,
    default: [],
  })
  genres: AlbumGenre[];

  @Column({ type: 'date', nullable: true })
  release_date: Date;

  @Column({ type: 'date', nullable: true })
  original_release_date: Date;

  @Column({ length: 255, nullable: true })
  record_label: string;

  @Column({ length: 255, nullable: true })
  catalog_number: string;

  @Column({ length: 255, nullable: true })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  liner_notes: string;

  @Column({ type: 'json', nullable: true })
  production_info: {
    producer?: string[];
    engineer?: string[];
    studio?: string;
    recorded_at?: string;
    mixed_by?: string[];
    mastered_by?: string[];
  };

  @Column({ type: 'json', nullable: true })
  copyright_info: {
    copyright_year?: number;
    copyright_holder?: string;
    publishing_rights?: string;
    mechanical_rights?: string;
  };

  @Column({ type: 'int', default: 0 })
  total_tracks: number;

  @Column({ type: 'int', default: 0 })
  total_duration: number; 

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'json', nullable: true })
  streaming_urls: {
    spotify?: string;
    apple_music?: string;
    youtube_music?: string;
    amazon_music?: string;
    tidal?: string;
    deezer?: string;
  };

  @Column({ type: 'json', nullable: true })
  purchase_urls: {
    bandcamp?: string;
    itunes?: string;
    amazon?: string;
    physical_store?: string;
  };

  // SEO and Discovery fields
  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'simple-array', nullable: true })
  keywords: string[];

  @Column({ type: 'json', nullable: true })
  social_media: {
    twitter_card?: string;
    og_image?: string;
    og_description?: string;
  };

  @Column({ type: 'boolean', default: true })
  is_explicit: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  play_count: number;

  @Column({ type: 'int', default: 0 })
  download_count: number;

  @Column({ type: 'int', default: 0 })
  like_count: number;

  // Relationships
  @ManyToOne(() => Artist, (artist) => artist.albums, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @Column('uuid')
  artist_id: string;

//   @OneToMany(() => Track, (track) => track.album, {
//     cascade: true,
//   })
//   tracks: Track[];

  @OneToMany(() => AlbumCredit, (credit) => credit.album, {
    cascade: true,
  })
  credits: AlbumCredit[];

  @OneToMany(() => AlbumArtwork, (artwork) => artwork.album, {
    cascade: true,
  })
  artwork: AlbumArtwork[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}