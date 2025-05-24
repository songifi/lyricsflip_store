import { IsUUID, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { AudioQuality } from '../enums/audio-quality.enum';

export class CreateDownloadRequestDto {
  @IsUUID()
  trackId: string;

  @IsEnum(AudioQuality)
  @IsOptional()
  quality?: AudioQuality = AudioQuality.HIGH;

  @IsBoolean()
  @IsOptional()
  offlineMode?: boolean = true;
}

export class UpdateDownloadProgressDto {
  @IsUUID()
  downloadId: string;

  @IsOptional()
  downloadedBytes?: number;

  @IsOptional()
  progress?: number;

  @IsOptional()
  errorMessage?: string;
}
