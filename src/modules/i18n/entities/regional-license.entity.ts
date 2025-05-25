import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum LicenseType {
  STREAMING = "streaming",
  DOWNLOAD = "download",
  SYNC = "sync",
  PERFORMANCE = "performance",
  MECHANICAL = "mechanical",
}

export enum LicenseStatus {
  ACTIVE = "active",
  PENDING = "pending",
  EXPIRED = "expired",
  RESTRICTED = "restricted",
}

@Entity("regional_licenses")
@Index(["entityId", "entityType", "region", "licenseType"], { unique: true })
export class RegionalLicense {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  @Index()
  entityId: string

  @Column({ type: "varchar", length: 50 })
  entityType: string // track, album, artist

  @Column({ type: "varchar", length: 10 })
  @Index()
  region: string // ISO country code

  @Column({
    type: "enum",
    enum: LicenseType,
  })
  licenseType: LicenseType

  @Column({
    type: "enum",
    enum: LicenseStatus,
    default: LicenseStatus.PENDING,
  })
  status: LicenseStatus

  @Column({ type: "decimal", precision: 10, scale: 4, nullable: true })
  royaltyRate?: number

  @Column({ type: "varchar", length: 10, nullable: true })
  currency?: string

  @Column({ type: "timestamp", nullable: true })
  validFrom?: Date

  @Column({ type: "timestamp", nullable: true })
  validUntil?: Date

  @Column({ type: "json", nullable: true })
  restrictions?: Record<string, any>

  @Column({ type: "varchar", length: 255, nullable: true })
  licenseProvider?: string

  @Column({ type: "text", nullable: true })
  notes?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
