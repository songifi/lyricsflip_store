import {
  IsEnum,
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsNumber,
  IsJSON,
} from 'class-validator';
import { DownloadStatus } from '../../entities/digital-download.entity';

export class CreateDigitalDownloadDto {
  @IsUUID()
  purchaseItemId: string;

  @IsUUID()
  userId: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsString()
  secureUrl: string;

  @IsString()
  fileFormat: string;

  @IsOptional()
  @IsString()
  bitrate?: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  fileHash: string;

  @IsEnum(DownloadStatus)
  status: DownloadStatus;

  @IsString()
  downloadToken: string;

  @IsDateString()
  expiresAt: Date;

  @IsOptional()
  @IsInt()
  maxDownloads?: number;

  @IsOptional()
  @IsJSON()
  metadata?: any;
}
