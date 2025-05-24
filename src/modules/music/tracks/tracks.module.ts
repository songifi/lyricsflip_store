import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksController } from './controllers/tracks.controller';
import { TracksService } from './providers/tracks.service';
import { AudioProcessingService } from './providers/audio-processing.service';
import { FileUploadModule } from 'src/common/modules/file-upload.module';
import { Track } from './entities/track.entity';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Track]),
    FileUploadModule,
    UsersModule, 
  ],
  controllers: [TracksController],
  providers: [TracksService, AudioProcessingService],
  exports: [TracksService, AudioProcessingService],
})
export class TracksModule {}
