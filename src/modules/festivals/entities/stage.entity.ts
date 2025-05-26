import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { Festival } from "./festival.entity"
import { Performance } from "./performance.entity"

@Entity("stages")
export class Stage {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: StageType,
    default: StageType.SECONDARY,
  })
  type: StageType

  @Column("int")
  capacity: number

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  latitude: number

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  longitude: number

  @Column("json", { nullable: true })
  technicalSpecs: {
    soundSystem: string
    lighting: string
    stage: {
      width: number
      depth: number
      height: number
    }
    power: string
    backline: string[]
  }

  @Column("json", { nullable: true })
  amenities: string[]

  @Column({ default: true })
  isActive: boolean

  @ManyToOne(
    () => Festival,
    (festival) => festival.stages,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "festivalId" })
  festival: Festival

  @Column("uuid")
  festivalId: string

  @OneToMany(
    () => Performance,
    (performance) => performance.stage,
    {
      cascade: true,
    },
  )
  performances: Performance[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
