@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => SubscriptionTier)
  tier: SubscriptionTier;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: true })
  autoRenew: boolean;

  @Column({ nullable: true })
  paymentReference: string;
}
