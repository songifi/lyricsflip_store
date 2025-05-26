import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { SyncLicense } from "./sync-license.entity"

@Entity("sync_fee_calculations")
export class SyncFeeCalculation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  baseFee: number

  @Column({ type: "decimal", precision: 5, scale: 4, default: 1.0 })
  mediaTypeMultiplier: number

  @Column({ type: "decimal", precision: 5, scale: 4, default: 1.0 })
  usageTypeMultiplier: number

  @Column({ type: "decimal", precision: 5, scale: 4, default: 1.0 })
  territoryMultiplier: number

  @Column({ type: "decimal", precision: 5, scale: 4, default: 1.0 })
  durationMultiplier: number

  @Column({ type: "decimal", precision: 5, scale: 4, default: 1.0 })
  exclusivityMultiplier: number

  @Column({ type: "decimal", precision: 5, scale: 4, default: 1.0 })
  budgetMultiplier: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  calculatedFee: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  negotiatedFee: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  finalFee: number

  @Column({ type: "varchar", length: 3, default: "USD" })
  currency: string

  @Column({ type: "jsonb", nullable: true })
  calculationDetails: {
    factors: Record<string, number>
    adjustments: Record<string, number>
    notes: string
  }

  @Column({ type: "uuid", nullable: true })
  calculatedBy: string

  @ManyToOne(
    () => SyncLicense,
    (license) => license.feeCalculations,
  )
  @JoinColumn({ name: "sync_license_id" })
  syncLicense: SyncLicense

  @CreateDateColumn()
  createdAt: Date
}
