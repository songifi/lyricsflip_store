import { Column, Entity } from "typeorm";

@Entity()
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  @Column("simple-array")
  facilities: string[];

  @OneToMany(() => Booking, booking => booking.venue)
  bookings: Booking[];

  @OneToMany(() => TechnicalSpec, spec => spec.venue)
  technicalSpecs: TechnicalSpec[];

  @OneToMany(() => Pricing, pricing => pricing.venue)
  pricing: Pricing[];

  @OneToMany(() => Promotion, promo => promo.venue)
  promotions: Promotion[];

  @OneToMany(() => Contract, contract => contract.venue)
  contracts: Contract[];

  @OneToMany(() => Analytics, analytics => analytics.venue)
  analytics: Analytics[];

  @OneToMany(() => Partnership, partner => partner.venue)
  partnerships: Partnership[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
