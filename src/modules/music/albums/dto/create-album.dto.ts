import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsObject,
  ValidateNested,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AlbumType } from '../enums/albumType.enum';
import { AlbumStatus } from '../enums/albumStatus.enum';
import { AlbumGenre } from '../enums/albumGenre.enum';
import { ProductionInfoDto } from './productionInfo.dto';
import { CopyrightInfoDto } from './copyrightInfo.dto';
import { StreamingUrlsDto } from './streamingUrls.dto';
import { SocialMediaDto } from './socialMedia.dto';
import { PurchaseUrlsDto } from './purchaseUrls.dto';

export class CreateAlbumDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsString()
  artist_id: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AlbumType)
  album_type?: AlbumType;

  @IsOptional()
  @IsEnum(AlbumStatus)
  status?: AlbumStatus;

  @IsOptional()
  @IsArray()
  @IsEnum(AlbumGenre, { each: true })
  genres?: AlbumGenre[];

  @IsOptional()
  @IsDateString()
  release_date?: string;

  @IsOptional()
  @IsDateString()
  original_release_date?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  record_label?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  catalog_number?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  barcode?: string;

  @IsOptional()
  @IsString()
  liner_notes?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProductionInfoDto)
  production_info?: ProductionInfoDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CopyrightInfoDto)
  copyright_info?: CopyrightInfoDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StreamingUrlsDto)
  streaming_urls?: StreamingUrlsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PurchaseUrlsDto)
  purchase_urls?: PurchaseUrlsDto;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  social_media?: SocialMediaDto;

  @IsOptional()
  @IsBoolean()
  is_explicit?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}