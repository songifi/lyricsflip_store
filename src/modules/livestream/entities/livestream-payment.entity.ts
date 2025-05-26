import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { LiveStream } from "./livestream.entity"
import { User } from "../../users/entities/user.entity"

@Entity("livestream_payments")
export class LiveStreamPayment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column({ length: 3, default: "USD" })
  currency: string

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus

  @Column({ nullable: true })
  paymentIntentId: string // Stripe payment intent ID

  @Column({ nullable: true })
  transactionId: string

  @Column({ type: "timestamp", nullable: true })
  paidAt: Date

  @Column({ type: "json", nullable: true })
  paymentMetadata: Record<string, any>

  @ManyToOne(
    () => LiveStream,
    (liveStream) => liveStream.payments,
  )
  @JoinColumn({ name: "liveStreamId" })
  liveStream: LiveStream

  @Column()
  liveStreamId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @Column()
  userId: string

  @CreateDateColumn()
  createdAt: Date
}
