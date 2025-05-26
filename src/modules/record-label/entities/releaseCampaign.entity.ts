import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Label } from './label.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { Album } from '../../music/albums/entities/album.entity';
import { CampaignTask } from './campaign-task.entity';

@Entity('release_campaigns')
export class ReleaseCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  releaseDate: Date;

  @Column({ type: 'date', nullable: true })
  announcementDate: Date;

  @Column({ type: 'enum', enum: ['planning', 'active', 'completed', 'cancelled'], default: 'planning' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'json' })
  strategy: {
    targetAudience: string[];
    platforms: string[];
    marketingChannels: string[];
    goals: string[];
  };

  @Column({ type: 'json', nullable: true })
  assets: {
    pressKit?: string;
    artwork?: string[];
    videos?: string[];
    photos?: string[];
  };

  @Column({ type: 'json', nullable: true })
  metrics: {
    preOrders?: number;
    streamingGoal?: number;
    salesGoal?: number;
    playlistPlacements?: number;
  };

  // Relationships
  @Column({ name: 'label_id' })
  labelId: string;

  @ManyToOne(() => Label, (label) => label.releaseCampaigns)
  @JoinColumn({ name: 'label_id' })
  label: Label;

  @Column({ name: 'artist_id' })
  artistId: string;

  @ManyToOne(() => Artist, { eager: true })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @Column({ name: 'album_id', nullable: true })
  albumId: string;

  @ManyToOne(() => Album, { eager: true })
  @JoinColumn({ name: 'album_id' })
  album: Album;

  @OneToMany(() => CampaignTask, (task) => task.campaign)
  tasks: CampaignTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}