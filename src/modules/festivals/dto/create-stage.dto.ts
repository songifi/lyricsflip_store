import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, ValidateNested, IsArray } from "class-validator"
import { Type } from "class-transformer"
import { StageType } from "../../../database/entities/stage.entity"

class TechnicalSpecsDto {
  @IsString()
  soundSystem: string

  @IsString()
  lighting: string

  @ValidateNested()
  stage: {
    width: number
    depth: number
    height: number
  }

  @IsString()
  power: string

  @IsArray()
  @IsString({ each: true })
  backline: string[]
}

export class CreateStageDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(StageType)
  type: StageType

  @IsNumber()
  capacity: number

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalSpecsDto)
  technicalSpecs?: TechnicalSpecsDto

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[]

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsString()
  festivalId: string
}
