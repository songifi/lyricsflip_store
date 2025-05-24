import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Genre } from "./genre.entity";

@Entity('genre_popularity_history')
@Index(['genreId', 'recordedAt'])  // Changed from 'genre' to 'genreId'
export class GenrePopularityHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  genreId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  popularity: number;

  @Column({ type: 'int', default: 0 })
  trackCount: number;

  @Column({ type: 'int', default: 0 })
  streamCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @ManyToMany(() => Genre, (genre) => genre.popularityHistory)
  genre: Genre;
}