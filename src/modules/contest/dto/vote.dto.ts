import { IsEnum, IsOptional, IsNumber, IsBoolean, IsString, Min, Max } from "class-validator"
import { VoteType } from "../entities/contest-vote.entity"

export class VoteDto {
  @IsEnum(VoteType)
  type: VoteType

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsBoolean()
  isPositive?: boolean

  @IsOptional()
  @IsString()
  comment?: string
}
