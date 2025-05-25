import { IsString, IsEnum, IsOptional, IsObject } from "class-validator"
import { MessageType } from "../entities/livestream-chat.entity"

export class SendChatMessageDto {
  @IsString()
  message: string

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType

  @IsOptional()
  @IsObject()
  metadata?: {
    emoji?: string
    mentions?: string[]
    links?: string[]
  }
}
