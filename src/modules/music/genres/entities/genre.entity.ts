import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Tree,
  TreeChildren,
  TreeParent,
  Index,
  ManyToMany,
  OneToMany,
} from 'typeorm';
// import { Track } from './track.entity';
// import { Album } from './album.entity';
import { GenreMood } from '../enums/genreMood.enum';
import { GenreEnergyLevel } from '../enums/genreEnergyLevel.enum';
import { GenrePopularityHistory } from './genrePopularityHistory.entity';

@Entity('genres')
@Tree('closure-table')
@Index(['slug'], { unique: true })
@Index(['isActive'])
@Index(['popularity'])
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 7, nullable: true })
  colorCode?: string; // Hex color for UI representation

  @Column({ type: 'enum', enum: GenreMood, array: true, default: [] })
  moods: GenreMood[];

  @Column({ 
    type: 'enum', 
    enum: GenreEnergyLevel, 
    default: GenreEnergyLevel.MODERATE 
  })
  energyLevel: GenreEnergyLevel;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  popularity: number; // 0-100 popularity score

  @Column({ type: 'int', default: 0 })
  trackCount: number;

  @Column({ type: 'int', default: 0 })
  albumCount: number;

  @Column({ type: 'int', default: 0 })
  artistCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional flexible data

  @TreeParent()
  parent?: Genre;

  @TreeChildren()
  children?: Genre[];

  // @ManyToMany(() => Track, (track) => track.genres)
  // tracks?: Track[];

  // @ManyToMany(() => Album, (album) => album.genres)
  // albums?: Album[];

  @ManyToMany(() => Genre, (genre) => genre.relatedGenres)
  relatedGenres?: Genre[];

  @OneToMany(() => GenrePopularityHistory, (history) => history.genre)
  popularityHistory?: GenrePopularityHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get level(): number {
    let level = 0;
    let current = this.parent;
    while (current) {
      level++;
      current = current.parent;
    }
    return level;
  }

  get fullPath(): string {
    const path: string[] = [this.name];
    let current = this.parent;
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    return path.join(' > ');
  }
}

