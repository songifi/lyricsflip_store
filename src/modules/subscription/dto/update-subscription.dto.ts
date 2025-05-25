import { IsOptional, IsBoolean, IsDateString, IsEnum, IsString } from 'class-validator';
import { SUBSCRIPTION_STATUSES } from '../subscription.constants';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsEnum(SUBSCRIPTION_STATUSES)
  status?: 'active' | 'expired' | 'pending' | 'cancelled';

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
