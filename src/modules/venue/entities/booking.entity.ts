@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, venue => venue.bookings)
  venue: Venue;

  @Column()
  artistName: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column()
  confirmed: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async validateBooking() {
    // Pseudo logic: ensure no overlap
  }
}
