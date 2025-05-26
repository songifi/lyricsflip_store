import { IsEnum, IsUUID, IsNumber, IsDateString, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TransferType } from '../entities/rights-transfer.entity';

export class CreateRightsTransferDto {
  @IsUUID()
  rightsId: string;

  @IsUUID()
  transferorId: string;

  @IsUUID()
  transfereeId: string;

  @IsEnum(TransferType)
  transferType: TransferType;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  @Type(() => Number)
  transferPercentage: number;

  @IsDateString()
  transferDate: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  considerationAmount?: number;

  @IsOptional()
  @IsString()
  considerationCurrency?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  conditions?: string;

  @IsOptional()
  @IsString()
  contractReference?: string;
}