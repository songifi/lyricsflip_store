@Entity()
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, venue => venue.promotions)
  venue: Venue;

  @Column()
  platform: string;

  @Column()
  campaignTitle: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column("text")
  description: string;
}
