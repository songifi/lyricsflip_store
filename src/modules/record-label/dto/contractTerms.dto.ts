import { IsString, IsDate, IsEnum, IsNumber, IsObject, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ContractTermsDto {
  @IsNumber()
  albumCommitment: number;

  @IsBoolean()
  exclusivity: boolean;

  @IsArray()
  @IsString({ each: true })
  territories: string[];

  @IsArray()
  @IsString({ each: true })
  rights: string[];

  @IsNumber()
  marketingCommitment: number;

  @IsBoolean()
  tourSupport: boolean;
}

export class CreateContractDto {
  @IsString()
  artistId: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNumber()
  royaltyRate: number;

  @IsOptional()
  @IsNumber()
  advanceAmount?: number;

  @IsObject()
  terms: ContractTermsDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  contractDocument?: string;
}