import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { FestivalStatus } from "../../../database/entities/festival.entity"

class TicketTierDto {
  @IsString()
  name: string

  @IsNumber()
  price: number

  @IsNumber()
  capacity: number

  @IsArray()
  @IsString({ each: true })
  benefits: string[]
}

class SocialMediaDto {
  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  facebook?: string

  @IsOptional()
  @IsString()
  instagram?: string

  @IsOptional()
  @IsString()
  twitter?: string
}

export class CreateFestivalDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsDateString()
  startDate: string

  @IsDateString()
  endDate: string

  @IsString()
  location: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsOptional()
  @IsEnum(FestivalStatus)
  status?: FestivalStatus

  @IsNumber()
  capacity: number

  @IsOptional()
  @IsNumber()
  ticketPrice?: number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketTierDto)
  ticketTiers?: TicketTierDto[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[]

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto
}
