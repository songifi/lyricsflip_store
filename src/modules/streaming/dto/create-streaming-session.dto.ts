import { IsUUID, IsEnum, IsOptional, IsString, IsNumber, IsIP } from 'class-validator';
import { AudioQuality } from '../enums/audio-quality.enum';

export class CreateStreamingSessionDto {
  @IsUUID()
  trackId: string;

  @IsEnum(AudioQuality)
  @IsOptional()
  quality?: AudioQuality = AudioQuality.HIGH;

  @IsIP()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsOptional()
  location?: any;
}

export class UpdateStreamingSessionDto {
  @IsEnum(AudioQuality)
  @IsOptional()
  quality?: AudioQuality;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsOptional()
  bytesStreamed?: number;

  @IsOptional()
  metadata?: any;
}
