import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsUUID, IsDateString } from 'class-validator';
import { ArchiveType, PreservationQuality } from '../entities/archive.entity';

export class CreateArchiveDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ArchiveType)
  archiveType: ArchiveType;

  @IsEnum(PreservationQuality)
  preservationQuality: PreservationQuality;

  @IsOptional()
  @IsObject()
  historicalMetadata?: {
    originalRecordingDate?: Date;
    recordingLocation?: string;
    recordingStudio?: string;
    producer?: string;
    engineer?: string;
    instruments?: string[];
    personnel?: Array<{
      name: string;
      role: string;
      instrument?: string;
    }>;
    culturalContext?: string;
    historicalSignificance?: string;
    era?: string;
    movement?: string;
  };

  @IsOptional()
  @IsObject()
  preservationData?: {
    originalFormat?: string;
    digitalFormat?: string;
    bitRate?: number;
    sampleRate?: number;
    channels?: number;
    duration?: number;
    fileSize?: number;
    checksum?: string;
    preservationDate?: Date;
    preservationMethod?: string;
    qualityAssessment?: string;
  };

  @IsOptional()
  @IsObject()
  rightsInformation?: {
    copyrightHolder?: string;
    copyrightYear?: number;
    publishingRights?: string;
    masterRights?: string;
    mechanicalRights?: string;
    performanceRights?: string;
    estateContact?: string;
    legalNotes?: string;
  };

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsString()
  accessUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPubliclyAccessible?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresPermission?: boolean;

  @IsOptional()
  @IsString()
  accessConditions?: string;

  @IsOptional()
  @IsUUID()
  artistId?: string;

  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsOptional()
  @IsUUID()
  albumId?: string;
}