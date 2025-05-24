import { IsBoolean, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class CrossfadeSettingsDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(0)
  @Max(10)
  duration: number;

  @IsEnum(['linear', 'exponential', 'logarithmic'])
  curve: 'linear' | 'exponential' | 'logarithmic';
}

export class GaplessPlaybackDto {
  @IsBoolean()
  enabled: boolean;

  @IsBoolean()
  preloadNext: boolean;

  @IsNumber()
  @Min(1)
  @Max(10)
  bufferSize: number;
}

export class PlaybackSettingsDto {
  @IsOptional()
  crossfade?: CrossfadeSettingsDto;

  @IsOptional()
  gapless?: GaplessPlaybackDto;

  @IsBoolean()
  @IsOptional()
  adaptiveQuality?: boolean;
}
