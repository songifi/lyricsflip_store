import { IsUUID, IsOptional, IsString, IsNumber, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

class ModifiedTermsDto {
  @ApiPropertyOptional()
  @IsOptional()
  exclusivity?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  modifications?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  creditRequired?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creditText?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalTerms?: string
}

export class ApproveSyncLicenseDto {
  @ApiProperty()
  @IsUUID()
  approvedBy: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  modifiedFee?: number

  @ApiPropertyOptional({ type: ModifiedTermsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModifiedTermsDto)
  modifiedTerms?: ModifiedTermsDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string
}
