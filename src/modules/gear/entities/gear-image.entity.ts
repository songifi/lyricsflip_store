import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { Gear } from "./gear.entity"

@Entity("gear_images")
export class GearImage {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 500 })
  url: string

  @Column({ length: 255, nullable: true })
  alt: string

  @Column({ default: 0 })
  sortOrder: number

  @Column({ default: false })
  isPrimary: boolean

  @Column("uuid")
  gearId: string

  @ManyToOne(
    () => Gear,
    (gear) => gear.images,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "gearId" })
  gear: Gear

  @CreateDateColumn()
  createdAt: Date
}
