import { IsString, IsDate, IsNumber, IsObject, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class CampaignStrategyDto {
  @IsArray()
  @IsString({ each: true })
  targetAudience: string[];

  @IsArray()
  @IsString({ each: true })
  platforms: string[];

  @IsArray()
  @IsString({ each: true })
  marketingChannels: string[];

  @IsArray()
  @IsString({ each: true })
  goals: string[];
}

class CampaignAssetsDto {
  @IsOptional()
  @IsString()
  pressKit?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  artwork?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  artistId: string;

  @IsOptional()
  @IsString()
  albumId?: string;

  @Type(() => Date)
  @IsDate()
  releaseDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  announcementDate?: Date;

  @IsNumber()
  budget: number;

  @IsObject()
  strategy: CampaignStrategyDto;

  @IsOptional()
  @IsObject()
  assets?: CampaignAssetsDto;
}