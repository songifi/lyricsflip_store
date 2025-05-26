import { PartialType } from "@nestjs/mapped-types"
import { CreateLiveStreamDto } from "./create-livestream.dto"
import { IsEnum, IsOptional } from "class-validator"
import { StreamStatus } from "../entities/livestream.entity"

export class UpdateLiveStreamDto extends PartialType(CreateLiveStreamDto) {
  @IsOptional()
  @IsEnum(StreamStatus)
  status?: StreamStatus
}
