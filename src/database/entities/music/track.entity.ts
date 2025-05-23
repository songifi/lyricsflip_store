import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsUrl, IsUUID } from 'class-validator';
import { BaseEntity } from '../base.entity';

@Entity('tracks')
export class Track extends BaseEntity {
  @Column({ length: 255 })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  description: string;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  duration: number;

  @Column({ name: 'artist_id' })
  @IsUUID()
  artistId: string;

  @Column({ name: 'album_id', nullable: true })
  @IsUUID()
  albumId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsUrl()
  audioUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsUrl()
  coverImageUrl: string;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  playCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;
}