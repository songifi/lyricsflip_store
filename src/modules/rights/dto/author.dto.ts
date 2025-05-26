import { IsEnum, IsUUID, IsString, IsDateString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RegistrationType } from '../entities/copyright-registration.entity';

export class AuthorDto {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  birthYear?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deathYear?: number;

  @IsOptional()
  @IsString()
  citizenship?: string;
}

export class ClaimantDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  transferDocument?: string;
}

export class CreateCopyrightRegistrationDto {
  @IsEnum(RegistrationType)
  registrationType: RegistrationType;

  @IsUUID()
  applicantId: string;

  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsOptional()
  @IsUUID()
  albumId?: string;

  @IsString()
  workTitle: string;

  @IsOptional()
  @IsString()
  workDescription?: string;

  @IsDateString()
  creationDate: string;

  @IsDateString()
  publicationDate: string;

  @IsArray()
  @Type(() => AuthorDto)
  authors: AuthorDto[];

  @IsOptional()
  @IsArray()
  @Type(() => ClaimantDto)
  claimants?: ClaimantDto[];

  @IsOptional()
  @IsString()
  previousRegistrations?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  filingFee?: number;
}