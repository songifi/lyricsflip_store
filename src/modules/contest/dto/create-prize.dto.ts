import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, Min } from "class-validator"
import { PrizeType } from "../entities/contest-prize.entity"

export class CreatePrizeDto {
  @IsNumber()
  @Min(1)
  position: number

  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(PrizeType)
  type: PrizeType

  @IsOptional()
  @IsNumber()
  @Min(0)
  cashValue?: number

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsDateString()
  expiresAt?: string

  @IsOptional()
  metadata?: Record<string, any>
}
