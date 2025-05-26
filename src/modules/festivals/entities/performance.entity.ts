import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Stage } from "./stage.entity"
import { Artist } from "./artist.entity"

@Entity("performances")
export class Performance {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("timestamp")
  startTime: Date

  @Column("timestamp")
  endTime: Date

  @Column("int", { default: 60 })
  durationMinutes: number

  @Column({
    type: "enum",
    enum: PerformanceStatus,
    default: PerformanceStatus.SCHEDULED,
  })
  status: PerformanceStatus

  @Column("text", { nullable: true })
  notes: string

  @Column("json", { nullable: true })
  technicalRequirements: {
    soundcheck: {
      duration: number
      requirements: string[]
    }
    equipment: string[]
    crew: string[]
    special: string[]
  }

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  fee: number

  @Column({ default: false })
  isHeadliner: boolean

  @ManyToOne(
    () => Stage,
    (stage) => stage.performances,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "stageId" })
  stage: Stage

  @Column("uuid")
  stageId: string

  @ManyToOne(() => Artist, { eager: true })
  @JoinColumn({ name: "artistId" })
  artist: Artist

  @Column("uuid")
  artistId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
