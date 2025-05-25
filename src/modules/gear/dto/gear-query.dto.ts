import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean, Min, Max } from "class-validator"
import { Transform, Type } from "class-transformer"
import { GearCategory, GearCondition, GearStatus } from "../entities/gear.entity"

export class GearQueryDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(GearCategory)
  category?: GearCategory

  @IsOptional()
  @IsEnum(GearCondition)
  condition?: GearCondition

  @IsOptional()
  @IsEnum(GearStatus)
  status?: GearStatus

  @IsOptional()
  @IsString()
  brand?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number.parseFloat(value) : undefined))
  minPrice?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number.parseFloat(value) : undefined))
  maxPrice?: number

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  allowsRental?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isVerified?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isFeatured?: boolean

  @IsOptional()
  @IsString()
  sellerId?: string

  @IsOptional()
  @IsString()
  sortBy?: "price" | "createdAt" | "viewCount" | "favoriteCount"

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC"

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1
}
