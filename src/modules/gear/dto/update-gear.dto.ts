import { PartialType } from "@nestjs/mapped-types"
import { CreateGearDto } from "./create-gear.dto"
import { IsEnum, IsOptional } from "class-validator"
import { GearStatus } from "../entities/gear.entity"

export class UpdateGearDto extends PartialType(CreateGearDto) {
  @IsOptional()
  @IsEnum(GearStatus)
  status?: GearStatus
}
