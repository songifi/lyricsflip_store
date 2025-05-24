import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsUUID, Length } from "class-validator"
import { MerchandiseType } from "../enums/merchandise.enums"

export class CreateMerchandiseCategoryDto {
  @IsString()
  @Length(1, 100)
  name: string

  @IsOptional()
  @IsString()
  @Length(1, 200)
  slug?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(MerchandiseType)
  type: MerchandiseType

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsOptional()
  @IsUUID()
  parentId?: string
}
