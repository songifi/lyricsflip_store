import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AlbumType } from '../enums/albumType.enum';
import { AlbumStatus } from '../enums/albumStatus.enum';
import { AlbumGenre } from '../enums/albumGenre.enum';

export class AlbumQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  artist_id?: string;

  @IsOptional()
  @IsEnum(AlbumType)
  album_type?: AlbumType;

  @IsOptional()
  @IsEnum(AlbumStatus)
  status?: AlbumStatus;

  @IsOptional()
  @IsEnum(AlbumGenre)
  genre?: AlbumGenre;

  @IsOptional()
  @IsString()
  record_label?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_explicit?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}