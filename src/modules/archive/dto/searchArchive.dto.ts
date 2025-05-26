import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ArchiveType, ArchiveStatus, PreservationQuality } from '../entities/archive.entity';

export class SearchArchiveDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(ArchiveType)
  archiveType?: ArchiveType;

  @IsOptional()
  @IsEnum(ArchiveStatus)
  status?: ArchiveStatus;

  @IsOptional()
  @IsEnum(PreservationQuality)
  preservationQuality?: PreservationQuality;

  @IsOptional()
  @IsString()
  artistId?: string;

  @IsOptional()
  @IsString()
  era?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isPubliclyAccessible?: boolean;

  @IsOptional()
  @IsString()
  recordingLocation?: string;

  @IsOptional()
  @IsString()
  producer?: string;

  @IsOptional()
  @IsString()
  recordingStudio?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}