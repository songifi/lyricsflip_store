import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Artist } from "../../artists/entities/artist.entity"

@Entity("revenue_analytics")
@Index(["artistId", "date"])
export class RevenueAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  artistId: string

  @ManyToOne(() => Artist)
  @JoinColumn({ name: "artistId" })
  artist: Artist

  @Column("date")
  date: Date

  // Revenue streams
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  streamingRevenue: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  merchandiseRevenue: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  eventRevenue: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  licensingRevenue: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalRevenue: number

  // Projections
  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  projectedRevenue30Days: number

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  projectedRevenue90Days: number

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  projectedRevenueYear: number

  // Growth metrics
  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  growthRate: number // percentage

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  monthOverMonthGrowth: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
