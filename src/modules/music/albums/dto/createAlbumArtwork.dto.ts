import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { ArtworkType } from '../enums/artworkType.enum';

export class CreateAlbumArtworkDto {
  @IsEnum(ArtworkType)
  artwork_type: ArtworkType;

  @IsUrl()
  file_url: string;

  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  filename?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  mime_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  file_size?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @IsOptional()
  @IsString()
  alt_text?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order_index?: number;
}