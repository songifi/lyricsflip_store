import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Length,
  Min,
} from 'class-validator';
import { CreditRole } from '../enums/creditRole.enum';

export class CreateAlbumCreditDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsEnum(CreditRole)
  role: CreditRole;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  custom_role?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order_index?: number;
}