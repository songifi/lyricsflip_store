// src/dto/listening-session.dto.ts
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsJSON,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SessionType, PlaybackSource } from '../entities/listening-session.entity';

export class CreateListeningSessionDto {
  @ApiProperty({ description: 'Track ID being played' })
  @IsString()
  trackId: string;

  @ApiPropertyOptional({ description: 'Album ID if playing from album' })
  @IsOptional()
  @IsString()
  albumId?: string;

  @ApiPropertyOptional({ description: 'Playlist ID if playing from playlist' })
  @IsOptional()
  @IsString()
  playlistId?: string;

  @ApiPropertyOptional({ description: 'Artist ID' })
  @IsOptional()
  @IsString()
  artistId?: string;

  @ApiPropertyOptional({ description: 'Track title for denormalized storage' })
  @IsOptional()
  @IsString()
  trackTitle?: string;

  @ApiPropertyOptional({ description: 'Artist name for denormalized storage' })
  @IsOptional()
  @IsString()
  artistName?: string;

  @ApiPropertyOptional({ description: 'Album title for denormalized storage' })
  @IsOptional()
  @IsString()
  albumTitle?: string;

  @ApiPropertyOptional({ description: 'Music genre' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({ description: 'Track duration in seconds', minimum: 0 })
  @IsNumber()
  @Min(0)
  duration: number;

  @ApiPropertyOptional({ 
    description: 'How long user actually listened in seconds', 
    minimum: 0,
    default: 0 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  playedDuration?: number;

  @ApiPropertyOptional({ 
    description: 'Whether track was completed (>80%)', 
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether track was skipped', 
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  isSkipped?: boolean;

  @ApiPropertyOptional({ 
    description: 'Type of listening session',
    enum: SessionType,
    default: SessionType.SINGLE_TRACK
  })
  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @ApiPropertyOptional({ 
    description: 'Source of playback',
    enum: PlaybackSource,
    default: PlaybackSource.WEB
  })
  @IsOptional()
  @IsEnum(PlaybackSource)
  playbackSource?: PlaybackSource;

  @ApiPropertyOptional({ description: 'Device information as JSON string' })
  @IsOptional()
  @IsJSON()
  deviceInfo?: string;

  @ApiPropertyOptional({ description: 'User location (City, Country)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'IP address of the request' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ 
    description: 'Whether session is offline', 
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  isOffline?: boolean;

  @ApiPropertyOptional({ description: 'Whether shuffle mode is enabled' })
  @IsOptional()
  @IsBoolean()
  shuffleMode?: boolean;

  @ApiPropertyOptional({ 
    description: 'Repeat mode setting',
    enum: ['off', 'track', 'playlist']
  })
  @IsOptional()
  @IsString()
  repeatMode?: string;

  @ApiPropertyOptional({ 
    description: 'Volume level (0.00 to 1.00)',
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  volume?: number;
}

export class UpdateListeningSessionDto extends PartialType(CreateListeningSessionDto) {
  @ApiPropertyOptional({ description: 'How long user actually listened in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  playedDuration?: number;

  @ApiPropertyOptional({ description: 'Whether track was completed' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Whether track was skipped' })
  @IsOptional()
  @IsBoolean()
  isSkipped?: boolean;

  @ApiPropertyOptional({ description: 'Volume level' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  volume?: number;
}

export class ListeningSessionQueryDto {
  @ApiPropertyOptional({ description: 'Filter by track ID' })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiPropertyOptional({ description: 'Filter by album ID' })
  @IsOptional()
  @IsString()
  albumId?: string;

  @ApiPropertyOptional({ description: 'Filter by playlist ID' })
  @IsOptional()
  @IsString()
  playlistId?: string;

  @ApiPropertyOptional({ description: 'Filter by artist ID' })
  @IsOptional()
  @IsString()
  artistId?: string;

  @ApiPropertyOptional({ description: 'Filter by genre' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by session type',
    enum: SessionType
  })
  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @ApiPropertyOptional({ 
    description: 'Filter by playback source',
    enum: PlaybackSource
  })
  @IsOptional()
  @IsEnum(PlaybackSource)
  playbackSource?: PlaybackSource;

  @ApiPropertyOptional({ description: 'Filter by completed sessions only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Filter by skipped sessions only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isSkipped?: boolean;

  @ApiPropertyOptional({ description: 'Filter by valid listens only (>30% completion)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  validListensOnly?: boolean;

  @ApiPropertyOptional({ description: 'Start date for filtering (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Sort by field',
    enum: ['createdAt', 'playedDuration', 'duration', 'trackTitle'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ListeningSessionStatsDto {
  @ApiPropertyOptional({ description: 'Get stats for specific time period in days', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  days?: number = 30;

  @ApiPropertyOptional({ description: 'Group stats by field', enum: ['genre', 'artist', 'album', 'playbackSource'] })
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional({ description: 'Include only valid listens (>30% completion)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  validListensOnly?: boolean = true;
}

export class BulkUpdateListeningSessionDto {
  @ApiProperty({ description: 'Array of session IDs to update' })
  @IsArray()
  @IsUUID(4, { each: true })
  sessionIds: string[];

  @ApiProperty({ description: 'Updates to apply to all sessions' })
  @ValidateNested()
  @Type(() => UpdateListeningSessionDto)
  updates: UpdateListeningSessionDto;
}

// Response DTOs
export class ListeningSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  trackId: string;

  @ApiPropertyOptional()
  albumId?: string;

  @ApiPropertyOptional()
  playlistId?: string;

  @ApiPropertyOptional()
  artistId?: string;

  @ApiPropertyOptional()
  trackTitle?: string;

  @ApiPropertyOptional()
  artistName?: string;

  @ApiPropertyOptional()
  albumTitle?: string;

  @ApiPropertyOptional()
  genre?: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  playedDuration: number;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isSkipped: boolean;

  @ApiProperty({ enum: SessionType })
  sessionType: SessionType;

  @ApiProperty({ enum: PlaybackSource })
  playbackSource: PlaybackSource;

  @ApiPropertyOptional()
  deviceInfo?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiProperty()
  isOffline: boolean;

  @ApiPropertyOptional()
  shuffleMode?: boolean;

  @ApiPropertyOptional()
  repeatMode?: string;

  @ApiPropertyOptional()
  volume?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ description: 'Completion percentage (0-100)' })
  completionPercentage: number;

  @ApiProperty({ description: 'Whether this counts as a valid listen (>30%)' })
  isValidListen: boolean;
}

export class PaginatedListeningSessionsDto {
  @ApiProperty({ type: [ListeningSessionResponseDto] })
  data: ListeningSessionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}