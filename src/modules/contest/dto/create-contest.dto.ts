import { IsString, IsEnum, IsDateString, IsNumber, IsOptional, IsArray, IsBoolean, Min, Max } from "class-validator"
import { ContestType, VotingType } from "../entities/contest.entity"

export class CreateContestDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  rules?: string

  @IsEnum(ContestType)
  type: ContestType

  @IsEnum(VotingType)
  votingType: VotingType

  @IsDateString()
  submissionStartDate: string

  @IsDateString()
  submissionEndDate: string

  @IsDateString()
  votingStartDate: string

  @IsDateString()
  votingEndDate: string

  @IsOptional()
  @IsDateString()
  announcementDate?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSubmissions?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSubmissionsPerUser?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  entryFee?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedGenres?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTags?: string[]

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(600)
  maxTrackDuration?: number

  @IsOptional()
  @IsNumber()
  @Min(5)
  minTrackDuration?: number

  @IsOptional()
  @IsString()
  coverImageUrl?: string

  @IsOptional()
  @IsString()
  bannerImageUrl?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean

  @IsOptional()
  metadata?: Record<string, any>
}
