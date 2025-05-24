import { IsOptional, IsString, IsUUID, IsEnum, IsBoolean, IsNumber, Min, Max } from "class-validator"
import { Transform } from "class-transformer"
import { MerchandiseStatus } from "../enums/merchandiseStatus.enum"
import { MerchandiseType } from "../enums/merchandise.enums"

export class QueryMerchandiseDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsUUID()
  artistId?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string

  @IsOptional()
  @IsEnum(MerchandiseType)
  type?: MerchandiseType

  @IsOptional()
  @IsEnum(MerchandiseStatus)
  status?: MerchandiseStatus

  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isLimitedEdition?: boolean

  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isPreOrder?: boolean

  @IsOptional()
  @Transform(({ value }) => Number.parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number

  @IsOptional()
  @Transform(({ value }) => Number.parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @IsString()
  tags?: string

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC"
}
