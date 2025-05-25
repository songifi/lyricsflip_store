@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSubscriptionDto) {
    return this.service.createSubscription(req.user.id, dto);
  }

  @Post('renew/:id')
  renew(@Param('id') id: number) {
    return this.service.renewSubscription(id);
  }

  @Post('gift')
  gift(@Body() dto: GiftSubscriptionDto) {
    return this.service.giftSubscription(dto);
  }
}
