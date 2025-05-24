import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './entities/album.entity';
import { AlbumCredit } from './entities/albumCredit.entity';
import { AlbumArtwork } from './entities/albumArtwork.entity';
import { AlbumsController } from './controllers/albums.controller';
import { AlbumsService } from './providers/albums.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Album,
      AlbumCredit,
      AlbumArtwork,
    ]),
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}