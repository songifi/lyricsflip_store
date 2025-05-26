@Entity()
export class TechnicalSpec {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, venue => venue.technicalSpecs)
  venue: Venue;

  @Column()
  stageType: string;

  @Column()
  soundSystem: string;

  @Column()
  lighting: string;

  @Column("text")
  otherRequirements: string;
}
