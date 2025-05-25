export class CreateSubscriptionDto {
  @IsNumber()
  tierId: number;

  @IsBoolean()
  autoRenew: boolean;
}
