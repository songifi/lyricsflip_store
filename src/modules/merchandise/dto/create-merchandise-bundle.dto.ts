import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
  Length,
  Max,
} from "class-validator"
import { Type } from "class-transformer"
import { MerchandiseStatus } from "../enums/merchandiseStatus.enum"
import { BundleType } from "../enums/bundleType.enum"

export class CreateMerchandiseBundleItemDto {
  @IsUUID()
  merchandiseId: string

  @IsNumber()
  @Min(1)
  quantity: number

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  individualPrice?: number

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class CreateMerchandiseBundleDto {
  @IsString()
  @Length(1, 200)
  name: string

  @IsOptional()
  @IsString()
  @Length(1, 300)
  slug?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsUUID()
  artistId: string

  @IsEnum(BundleType)
  type: BundleType

  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number

  @IsOptional()
  @IsEnum(MerchandiseStatus)
  status?: MerchandiseStatus

  @IsOptional()
  @IsBoolean()
  isLimitedEdition?: boolean

  @IsOptional()
  @IsNumber()
  @Min(1)
  limitedQuantity?: number

  @IsOptional()
  @IsDateString()
  validFrom?: string

  @IsOptional()
  @IsDateString()
  validUntil?: string

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMerchandiseBundleItemDto)
  items: CreateMerchandiseBundleItemDto[]
}
