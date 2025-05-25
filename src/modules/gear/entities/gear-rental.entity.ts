import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm"
import { Gear } from "./gear.entity"
import { User } from "../../users/entities/user.entity"

@Entity("gear_rentals")
export class GearRental {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  gearId: string

  @Column("uuid")
  renterId: string

  @Column("date")
  startDate: Date

  @Column("date")
  endDate: Date

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number

  @Column("decimal", { precision: 10, scale: 2 })
  securityDeposit: number

  @Column({
    type: "enum",
    enum: RentalStatus,
    default: RentalStatus.PENDING,
  })
  status: RentalStatus

  @Column("text", { nullable: true })
  notes: string

  @Column("text", { nullable: true })
  returnConditionNotes: string

  @Column({ default: false })
  insuranceRequired: boolean

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  insuranceCost: number

  @ManyToOne(
    () => Gear,
    (gear) => gear.rentals,
  )
  @JoinColumn({ name: "gearId" })
  gear: Gear

  @ManyToOne(() => User)
  @JoinColumn({ name: "renterId" })
  renter: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
