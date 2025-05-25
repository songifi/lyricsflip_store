import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  IsObject,
} from "class-validator"
import { StreamType, StreamQuality } from "../entities/livestream.entity"

export class CreateLiveStreamDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(StreamType)
  type: StreamType

  @IsDateString()
  scheduledStartTime: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxViewers?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  ticketPrice?: number

  @IsOptional()
  @IsBoolean()
  isPayPerView?: boolean

  @IsOptional()
  @IsBoolean()
  isChatEnabled?: boolean

  @IsOptional()
  @IsBoolean()
  isRecordingEnabled?: boolean

  @IsOptional()
  @IsEnum(StreamQuality)
  maxQuality?: StreamQuality

  @IsOptional()
  @IsString()
  thumbnailUrl?: string

  @IsUUID()
  artistId: string

  @IsOptional()
  @IsUUID()
  eventId?: string

  @IsOptional()
  @IsObject()
  streamSettings?: {
    bitrate?: number
    fps?: number
    resolution?: string
    audioCodec?: string
    videoCodec?: string
  }

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
