import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Artist } from "./entities/artist.entity"
import { ArtistsController } from "./controllers/artists.controller"
import { ArtistsService } from "./providers/artists.service"

@Module({
  imports: [TypeOrmModule.forFeature([Artist])],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
