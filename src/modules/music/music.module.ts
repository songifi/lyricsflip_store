import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { TracksModule } from './tracks/tracks.module';
import { AlbumsModule } from './albums/albums.module';
import { GenreModule } from './genres/genres.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  controllers: [MusicController],
  providers: [MusicService],
  imports: [TracksModule, AlbumsModule, GenreModule, PlaylistsModule],
})
export class MusicModule {}
