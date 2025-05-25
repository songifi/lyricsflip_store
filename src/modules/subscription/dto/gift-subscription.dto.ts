export class GiftSubscriptionDto {
  @IsEmail()
  recipientEmail: string;

  @IsNumber()
  tierId: number;

  @IsOptional()
  @IsString()
  message?: string;
}
