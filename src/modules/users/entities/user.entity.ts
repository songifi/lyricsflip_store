import { Track } from 'src/database/entities/music/track.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Track, (track) => track.artistId)
  tracks: Track[];

  @OneToMany(() => Video, video => video.user)
  uploadedVideos: Video[];

}
