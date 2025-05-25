import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { LiveStreamPayment, PaymentStatus } from "./entities/livestream-payment.entity"
import { LiveStream } from "./entities/livestream.entity"
import type { ConfigService } from "@nestjs/config"
import Stripe from "stripe"

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(LiveStreamPayment)
    private paymentRepository: Repository<LiveStreamPayment>,
    @InjectRepository(LiveStream)
    private liveStreamRepository: Repository<LiveStream>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    userId: string,
    liveStreamId: string,
  ): Promise<{ clientSecret: string; paymentId: string }> {
    const liveStream = await this.liveStreamRepository.findOne({
      where: { id: liveStreamId },
    })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    if (!liveStream.isPayPerView || !liveStream.ticketPrice) {
      throw new BadRequestException("This stream is not pay-per-view")
    }

    // Check if user already has access
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        userId,
        liveStreamId,
        status: PaymentStatus.COMPLETED,
      },
    })

    if (existingPayment) {
      throw new BadRequestException("User already has access to this stream")
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(liveStream.ticketPrice * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        liveStreamId,
        streamTitle: liveStream.title,
      },
    })

    // Create payment record
    const payment = this.paymentRepository.create({
      userId,
      liveStreamId,
      amount: liveStream.ticketPrice,
      currency: "USD",
      status: PaymentStatus.PENDING,
      paymentIntentId: paymentIntent.id,
    })

    const savedPayment = await this.paymentRepository.save(payment)

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: savedPayment.id,
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<LiveStreamPayment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentIntentId },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    // Verify payment with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === "succeeded") {
      payment.status = PaymentStatus.COMPLETED
      payment.paidAt = new Date()
      payment.transactionId = paymentIntent.id
      payment.paymentMetadata = {
        stripePaymentIntent: paymentIntent,
      }

      return await this.paymentRepository.save(payment)
    } else {
      payment.status = PaymentStatus.FAILED
      return await this.paymentRepository.save(payment)
    }
  }

  async refundPayment(paymentId: string, reason?: string): Promise<LiveStreamPayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException("Payment cannot be refunded")
    }

    // Process refund with Stripe
    const refund = await this.stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        reason: reason || "Customer requested refund",
      },
    })

    payment.status = PaymentStatus.REFUNDED
    payment.paymentMetadata = {
      ...payment.paymentMetadata,
      refund,
    }

    return await this.paymentRepository.save(payment)
  }

  async getPaymentHistory(userId: string): Promise<LiveStreamPayment[]> {
    return await this.paymentRepository.find({
      where: { userId },
      relations: ["liveStream"],
      order: { createdAt: "DESC" },
    })
  }

  async getStreamRevenue(liveStreamId: string): Promise<{
    totalRevenue: number
    totalTicketsSold: number
    refundedAmount: number
  }> {
    const payments = await this.paymentRepository.find({
      where: { liveStreamId },
    })

    const completedPayments = payments.filter((p) => p.status === PaymentStatus.COMPLETED)
    const refundedPayments = payments.filter((p) => p.status === PaymentStatus.REFUNDED)

    return {
      totalRevenue: completedPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      totalTicketsSold: completedPayments.length,
      refundedAmount: refundedPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    }
  }
}
