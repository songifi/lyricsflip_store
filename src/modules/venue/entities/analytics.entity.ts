@Entity()
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, venue => venue.analytics)
  venue: Venue;

  @Column()
  metric: string;

  @Column('float')
  value: number;

  @Column()
  date: Date;
}
