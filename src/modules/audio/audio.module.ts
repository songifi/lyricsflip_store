// src/audio/audio.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioFile } from './entities/audio-file.entity';
import { AudioController } from './controllers/audio.controller';
import { AudioService } from './services/audio.service';

@Module({
  imports: [TypeOrmModule.forFeature([AudioFile])],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
