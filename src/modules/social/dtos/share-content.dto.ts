import { IsEnum, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { SharedContentType } from '../entities/shared-content.entity';

export class ShareContentDto {
  @IsEnum(SharedContentType)
  type: SharedContentType;

  @ValidateIf(o => o.type === SharedContentType.URL)
  @IsString()
  url?: string;

  @ValidateIf(o => o.type === SharedContentType.POST)
  @IsUUID()
  postId?: string;

  @ValidateIf(o => o.type === SharedContentType.TRACK)
  @IsUUID()
  trackId?: string;
}
