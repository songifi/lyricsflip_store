import {
  IsEnum,
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
} from "class-validator"
import { Type, Transform } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { MediaType, UsageType, Territory } from "../../../database/entities/sync-license.entity"

class UsageTermsDto {
  @ApiProperty()
  @IsBoolean()
  exclusivity: boolean

  @ApiProperty()
  @IsBoolean()
  modifications: boolean

  @ApiProperty()
  @IsBoolean()
  creditRequired: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creditText?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictions?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalTerms?: string
}

class DistributionRightsDto {
  @ApiProperty()
  @IsBoolean()
  theatrical: boolean

  @ApiProperty()
  @IsBoolean()
  television: boolean

  @ApiProperty()
  @IsBoolean()
  streaming: boolean

  @ApiProperty()
  @IsBoolean()
  digital: boolean

  @ApiProperty()
  @IsBoolean()
  physical: boolean

  @ApiProperty()
  @IsBoolean()
  educational: boolean

  @ApiProperty()
  @IsBoolean()
  promotional: boolean
}

export class CreateSyncLicenseDto {
  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  mediaType: MediaType

  @ApiProperty({ enum: UsageType })
  @IsEnum(UsageType)
  usageType: UsageType

  @ApiProperty({ enum: Territory })
  @IsEnum(Territory)
  territory: Territory

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificCountries?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  licenseFee?: number

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiProperty()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date

  @ApiProperty()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationSeconds?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usageDescription?: string

  @ApiProperty({ type: UsageTermsDto })
  @ValidateNested()
  @Type(() => UsageTermsDto)
  usageTerms: UsageTermsDto

  @ApiProperty({ type: DistributionRightsDto })
  @ValidateNested()
  @Type(() => DistributionRightsDto)
  distributionRights: DistributionRightsDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty()
  @IsUUID()
  trackId: string

  @ApiProperty()
  @IsUUID()
  mediaProjectId: string

  @ApiProperty()
  @IsUUID()
  clientId: string
}
