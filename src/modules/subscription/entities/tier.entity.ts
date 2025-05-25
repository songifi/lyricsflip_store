@Entity()
export class SubscriptionTier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., Free, Premium, Family

  @Column()
  price: number;

  @Column()
  durationInDays: number;

  @Column("simple-array")
  features: string[];
}
