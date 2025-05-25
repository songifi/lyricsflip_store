import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MemberPermission } from '../../../database/entities/band-member.entity';
import { InstrumentType } from '../../../database/entities/band-role.entity';

export class BandRoleDto {
  @IsEnum(InstrumentType)
  instrument: InstrumentType;

  @IsOptional()
  @IsString()
  customRole?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(MemberPermission)
  permission?: MemberPermission;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BandRoleDto)
  roles?: BandRoleDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}