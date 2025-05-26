// src/audio/dto/upload-audio.dto.ts
import { IsNotEmpty, IsMimeType } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadAudioDto {
  @IsNotEmpty()
  @IsMimeType()
  @Type(() => Object)
  file: Express.Multer.File;
}
