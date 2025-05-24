import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { GenrePopularityHistory } from './entities/genrePopularityHistory.entity';
import { GenreController } from './controllers/genres.controller';
import { GenreService } from './providers/genres.service';
import { GenreSeederService } from './providers/genre-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Genre, GenrePopularityHistory]),
  ],
  controllers: [GenreController],
  providers: [GenreService, GenreSeederService],
  exports: [GenreService, GenreSeederService],
})
export class GenreModule {}
