import { IsString, IsUUID, IsOptional, IsDateString, IsObject, IsEnum } from 'class-validator';
import { PlatformType } from '../entities/distribution-partner.entity';

export class CreateDistributionReleaseDto {
  @IsUUID()
  trackId: string;

  @IsUUID()
  albumId: string;

  @IsUUID()
  artistId: string;

  @IsEnum(PlatformType)
  platform: PlatformType;

  @IsOptional()
  @IsDateString()
  scheduledReleaseDate?: string;

  @IsOptional()
  @IsObject()
  platformSpecificData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  distributionMetadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}
