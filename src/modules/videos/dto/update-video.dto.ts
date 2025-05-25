import { PartialType } from "@nestjs/swagger"
import { CreateVideoDto } from "./create-video.dto"
import { IsOptional, IsEnum } from "class-validator"
import { VideoStatus } from "../entities/video.entity"

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus
}
