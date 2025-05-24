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
} from "class-validator"
import { Type } from "class-transformer"
import { MerchandiseStatus } from "../enums/merchandiseStatus.enum"

export class CreateMerchandiseVariantDto {
  @IsString()
  @Length(1, 100)
  name: string

  @IsString()
  @Length(1, 100)
  sku: string

  @IsString()
  type: string

  @IsString()
  @Length(1, 100)
  value: string

  @IsOptional()
  @IsNumber()
  priceModifier?: number

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsNumber()
  weight?: number

  @IsOptional()
  attributes?: Record<string, any>

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialQuantity?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number
}

export class CreateMerchandiseImageDto {
  @IsString()
  url: string

  @IsOptional()
  @IsString()
  thumbnailUrl?: string

  @IsOptional()
  @IsString()
  altText?: string

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class CreateMerchandiseDto {
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

  @IsOptional()
  @IsString()
  shortDescription?: string

  @IsUUID()
  artistId: string

  @IsUUID()
  categoryId: string

  @IsOptional()
  @IsString()
  @Length(1, 100)
  sku?: string

  @IsNumber()
  @Min(0)
  basePrice: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number

  @IsOptional()
  @IsEnum(MerchandiseStatus)
  status?: MerchandiseStatus

  @IsOptional()
  @IsBoolean()
  isLimitedEdition?: boolean

  @IsOptional()
  @IsNumber()
  @Min(1)
  limitedEditionQuantity?: number

  @IsOptional()
  @IsBoolean()
  isPreOrder?: boolean

  @IsOptional()
  @IsDateString()
  preOrderReleaseDate?: string

  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean

  @IsOptional()
  @IsNumber()
  weight?: number

  @IsOptional()
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  metadata?: Record<string, any>

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMerchandiseVariantDto)
  variants?: CreateMerchandiseVariantDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMerchandiseImageDto)
  images?: CreateMerchandiseImageDto[]
}
