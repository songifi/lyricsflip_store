import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
  ValidateNested,
  Min,
  Length,
  IsDecimal,
} from "class-validator"
import { Type, Transform } from "class-transformer"
import { TrackStatus } from "../enums/trackStatus.enum"
import { CreditsDto } from "./credits.dto"
import { CopyrightInfoDto } from "./copyrightInfo.dto"

export class CreateTrackDto {
  @IsString()
  @Length(1, 255)
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsUUID()
  artistId: string

  @IsOptional()
  @IsUUID()
  albumId?: string

  @IsOptional()
  @IsUUID()
  genreId?: string

  @IsOptional()
  @IsString()
  @Length(12, 12)
  isrc?: string

  @IsOptional()
  @IsString()
  upc?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  trackNumber?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  discNumber?: number

  @IsOptional()
  @IsString()
  lyrics?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CreditsDto)
  credits?: CreditsDto

  @IsOptional()
  @IsDateString()
  releaseDate?: string

  @IsOptional()
  @IsString()
  label?: string

  @IsOptional()
  @IsString()
  publisher?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CopyrightInfoDto)
  copyrightInfo?: CopyrightInfoDto

  @IsOptional()
  @IsEnum(TrackStatus)
  status?: TrackStatus

  @IsOptional()
  @IsBoolean()
  isExplicit?: boolean

  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean

  @IsOptional()
  @IsBoolean()
  allowStreaming?: boolean

  @IsOptional()
  @IsDecimal({ decimal_digits: "2" })
  @Transform(({ value }) => Number.parseFloat(value))
  price?: number

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string
}
