@Entity()
export class Partnership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, venue => venue.partnerships)
  venue: Venue;

  @Column()
  partnerName: string;

  @Column()
  type: string;

  @Column()
  contactEmail: string;
}
