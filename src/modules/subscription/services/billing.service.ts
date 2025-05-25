@Injectable()
export class BillingService {
  async processPayment(userId: number, amount: number): Promise<string> {
    // Integration with Stripe/Paystack/Flutterwave etc.
    return `PAY-${Date.now()}-${userId}`; // Mock reference
  }
}
