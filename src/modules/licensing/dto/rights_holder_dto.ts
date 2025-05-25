// src/licensing/dto/rights-holder.dto.ts
import {
  IsString,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  ValidateNested,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RightsHolderType, RightsHolderStatus } from '../entities/rights-holder.entity';

export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @Length(1, 255)
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @Length(1, 100)
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  @Length(1, 100)
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @Length(1, 20)
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @Length(2, 100)
  country: string;
}

export class BankingInfoDto {
  @ApiProperty({ description: 'Bank name' })
  @IsString()
  @Length(1, 255)
  bankName: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  @Length(1, 50)
  accountNumber: string;

  @ApiProperty({ description: 'Routing number' })
  @IsString()
  @Length(1, 20)
  routingNumber: string;

  @ApiPropertyOptional({ description: 'SWIFT code for international transfers' })
  @IsOptional()
  @IsString()
  @Length(8, 11)
  swiftCode?: string;

  @ApiPropertyOptional({ description: 'IBAN for international transfers' })
  @IsOptional()
  @IsString()
  @Length(15, 34)
  iban?: string;
}

export class PerformanceRightsSocietiesDto {
  @ApiPropertyOptional({ description: 'ASCAP member number' })
  @IsOptional()
  @IsString()
  ascap?: string;

  @ApiPropertyOptional({ description: 'BMI member number' })
  @IsOptional()
  @IsString()
  bmi?: string;

  @ApiPropertyOptional({ description: 'SESAC member number' })
  @IsOptional()
  @IsString()
  sesac?: string;

  @ApiPropertyOptional({ description: 'PRS member number' })
  @IsOptional()
  @IsString()
  prs?: string;

  @ApiPropertyOptional({ description: 'GEMA member number' })
  @IsOptional()
  @IsString()
  gema?: string;

  @ApiPropertyOptional({ description: 'SACEM member number' })
  @IsOptional()
  @IsString()
  sacem?: string;

  @ApiPropertyOptional({ description: 'JASRAC member number' })
  @IsOptional()
  @IsString()
  jasrac?: string;

  @ApiPropertyOptional({ 
    description: 'Other performing rights societies',
    type: [Object]
  })
  @IsOptional()
  @IsArray()
  other?: Array<{ name: string; memberNumber: string }>;
}

export class DocumentDto {
  @ApiProperty({ description: 'Document ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Document type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Document filename' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt: Date;
}

export class CreateRightsHolderDto {
  @ApiProperty({ description: 'Rights holder name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Legal name if different from name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  legalName?: string;

  @ApiProperty({ enum: RightsHolderType, description: 'Type of rights holder' })
  @IsEnum(RightsHolderType)
  type: RightsHolderType;

  @ApiPropertyOptional({ description: 'IPI (Interested Party Information) code' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  ipi?: string;

  @ApiPropertyOptional({ description: 'ISNI (International Standard Name Identifier)' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  isni?: string;

  @ApiPropertyOptional({ description: 'Tax identification number' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  taxId?: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ description: 'Address information', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ description: 'Banking information', type: BankingInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankingInfoDto)
  bankingInfo?: BankingInfoDto;

  @ApiPropertyOptional({ description: 'Territories where they hold rights', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  territories?: string[];

  @ApiPropertyOptional({ 
    description: 'Default royalty share as decimal (0.0 to 1.0)',
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  defaultRoyaltyShare?: number;

  @ApiPropertyOptional({ 
    description: 'Performance rights societies memberships',
    type: PerformanceRightsSocietiesDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceRightsSocietiesDto)
  performanceRightsSocieties?: PerformanceRightsSocietiesDto;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRightsHolderDto extends PartialType(CreateRightsHolderDto) {
  @ApiPropertyOptional({ enum: RightsHolderStatus, description: 'Rights holder status' })
  @IsOptional()
  @IsEnum(RightsHolderStatus)
  status?: RightsHolderStatus;

  @ApiPropertyOptional({ description: 'Whether the rights holder is verified' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class RightsHolderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  legalName?: string;

  @ApiProperty({ enum: RightsHolderType })
  type: RightsHolderType;

  @ApiProperty({ enum: RightsHolderStatus })
  status: RightsHolderStatus;

  @ApiPropertyOptional()
  ipi?: string;

  @ApiPropertyOptional()
  isni?: string;

  @ApiPropertyOptional()
  taxId?: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty({ type: AddressDto })
  address: AddressDto;

  @ApiPropertyOptional({ type: BankingInfoDto })
  bankingInfo?: BankingInfoDto;

  @ApiPropertyOptional({ type: [String] })
  territories?: string[];

  @ApiProperty()
  defaultRoyaltyShare: number;

  @ApiPropertyOptional({ type: PerformanceRightsSocietiesDto })
  performanceRightsSocieties?: PerformanceRightsSocietiesDto;

  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional()
  verifiedAt?: Date;

  @ApiPropertyOptional()
  verifiedBy?: string;

  @ApiPropertyOptional({ type: [DocumentDto] })
  documents?: DocumentDto[];

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RightsHolderQueryDto {
  @ApiPropertyOptional({ description: 'Filter by rights holder type', enum: RightsHolderType })
  @IsOptional()
  @IsEnum(RightsHolderType)
  type?: RightsHolderType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: RightsHolderStatus })
  @IsOptional()
  @IsEnum(RightsHolderStatus)
  status?: RightsHolderStatus;

  @ApiPropertyOptional({ description: 'Filter by verification status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Search in name and legal name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by territory' })
  @IsOptional()
  @IsString()
  territory?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class VerifyRightsHolderDto {
  @ApiProperty({ description: 'Verification status' })
  @IsBoolean()
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'Verification notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}