import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ReleaseStatus } from '../entities/distribution-release.entity';

export class UpdateDistributionStatusDto {
  @IsEnum(ReleaseStatus)
  status: ReleaseStatus;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
