@Entity()
export class Pricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, venue => venue.pricing)
  venue: Venue;

  @Column()
  season: string;

  @Column('decimal')
  basePrice: number;

  @Column()
  includesLighting: boolean;

  @Column()
  includesSound: boolean;
}
