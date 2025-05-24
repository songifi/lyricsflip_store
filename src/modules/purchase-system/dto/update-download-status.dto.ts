import { IsEnum } from 'class-validator';
import { DownloadStatus } from '../../entities/digital-download.entity';

export class UpdateDownloadStatusDto {
  @IsEnum(DownloadStatus)
  status: DownloadStatus;
}
