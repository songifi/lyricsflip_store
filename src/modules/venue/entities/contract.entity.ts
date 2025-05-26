@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, venue => venue.contracts)
  venue: Venue;

  @Column()
  artistName: string;

  @Column('text')
  terms: string;

  @Column()
  signed: boolean;
}
