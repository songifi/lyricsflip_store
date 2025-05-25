@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private repo: Repository<Subscription>,
    private billing: BillingService
  ) {}

  async createSubscription(userId: number, dto: CreateSubscriptionDto) {
    const tier = await this.getTier(dto.tierId);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + tier.durationInDays);

    const paymentRef = await this.billing.processPayment(userId, tier.price);

    return this.repo.save({
      user: { id: userId },
      tier,
      startDate,
      endDate,
      autoRenew: dto.autoRenew,
      paymentReference: paymentRef
    });
  }

  async renewSubscription(subscriptionId: number) {
    const subscription = await this.repo.findOne({ where: { id: subscriptionId }, relations: ['tier'] });
    if (!subscription.autoRenew) throw new BadRequestException('Auto-renewal is disabled.');

    const paymentRef = await this.billing.processPayment(subscription.user.id, subscription.tier.price);
    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + subscription.tier.durationInDays * 86400000);
    subscription.paymentReference = paymentRef;

    return this.repo.save(subscription);
  }
}
