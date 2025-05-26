// src/audio/controllers/audio.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from '../services/audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    return this.audioService.handleUpload(file);
  }
}
