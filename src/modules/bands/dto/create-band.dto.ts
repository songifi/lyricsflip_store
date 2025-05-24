import { IsString, IsOptional, IsEnum, IsDateString, IsObject, IsUrl, MaxLength } from 'class-validator';
import { BandStatus } from '../../../database/entities/band.entity';

export class CreateBandDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  genre?: string;

  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @IsUrl()
  bannerImage?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };

  @IsOptional()
  @IsEnum(BandStatus)
  status?: BandStatus;

  @IsOptional()
  @IsDateString()
  formedDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}