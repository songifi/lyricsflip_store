import { IsString, IsOptional, IsEnum, IsObject } from "class-validator"
import { AudioVersionType } from "../entities/audio-version.entity"

export class UploadAudioDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(AudioVersionType)
  type: AudioVersionType

  @IsOptional()
  @IsString()
  parentVersionId?: string

  @IsOptional()
  @IsObject()
  changes?: {
    summary: string
    details: string[]
  }

  @IsOptional()
  @IsObject()
  metadata?: {
    bitrate?: number
    sampleRate?: number
    channels?: number
    codec?: string
    bpm?: number
    key?: string
  }
}
