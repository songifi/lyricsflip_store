import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  Length,
} from "class-validator"
import { Type, Transform } from "class-transformer"
import { GearCategory, GearCondition } from "../entities/gear.entity"

class DimensionsDto {
  @IsNumber()
  @Min(0)
  length: number

  @IsNumber()
  @Min(0)
  width: number

  @IsNumber()
  @Min(0)
  height: number
}

class GearImageDto {
  @IsString()
  url: string

  @IsOptional()
  @IsString()
  alt?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean
}

export class CreateGearDto {
  @IsString()
  @Length(1, 255)
  title: string

  @IsString()
  @Length(1, 5000)
  description: string

  @IsEnum(GearCategory)
  category: GearCategory

  @IsString()
  @Length(1, 100)
  brand: string

  @IsString()
  @Length(1, 100)
  model: string

  @IsOptional()
  @IsString()
  @Length(1, 50)
  year?: string

  @IsOptional()
  @IsString()
  @Length(1, 100)
  serialNumber?: string

  @IsEnum(GearCondition)
  condition: GearCondition

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  conditionNotes?: string

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number.parseFloat(value))
  price: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number.parseFloat(value) : undefined))
  originalPrice?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number.parseFloat(value) : undefined))
  rentalPriceDaily?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number.parseFloat(value) : undefined))
  rentalPriceWeekly?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number.parseFloat(value) : undefined))
  rentalPriceMonthly?: number

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedAccessories?: string[]

  @IsOptional()
  @IsBoolean()
  allowsRental?: boolean

  @IsOptional()
  @IsBoolean()
  requiresInsurance?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number.parseFloat(value) : undefined))
  weight?: number

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto

  @IsOptional()
  @IsString()
  @Length(1, 100)
  location?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GearImageDto)
  images?: GearImageDto[]
}
