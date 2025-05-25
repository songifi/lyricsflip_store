import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  Min,
  Max,
  Length,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SampleType } from '../entities/sample.entity';

export class CreateSampleDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SampleType)
  type: SampleType;

  @IsUrl()
  fileUrl: string;

  @IsOptional()
  @IsUrl()
  previewUrl?: string;

  @IsNumber()
  @Min(1)
  fileSize: number;

  @IsNumber()
  @Min(0.1)
  duration: number;

  @IsOptional()
  @IsNumber()
  @Min(8000)
  @Max(192000)
  sampleRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(8)
  @Max(32)
  bitDepth?: number;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  key?: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(200)
  bpm?: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsOptional()
  @IsBoolean()
  allowsExclusiveLicensing?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exclusivePrice?: number;

  @IsOptional()
  @IsUUID()
  artistId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateSampleDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SampleType)
  type?: SampleType;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  key?: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(200)
  bpm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsOptional()
  @IsBoolean()
  allowsExclusiveLicensing?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exclusivePrice?: number;

  @IsOptional()
  @IsUUID()
  artistId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}

export class SampleQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SampleType)
  type?: SampleType;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  genreIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  tags?: string[];

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Type(() => Number)
  minBpm?: number;

  @IsOptional()
  @IsNumber()
  @Max(200)
  @Type(() => Number)
  maxBpm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  minDuration?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDuration?: number;

  @IsOptional()
  @IsUUID()
  creatorId?: string;

  @IsOptional()
  @IsUUID()
  artistId?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'price' | 'playCount' | 'downloadCount' | 'title';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}