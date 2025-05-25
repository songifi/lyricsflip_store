import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { InventoryItem } from "./inventory-item.entity"

@Entity("inventory_forecasts")
export class InventoryForecast {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  inventoryItemId: string

  @ManyToOne(() => InventoryItem)
  @JoinColumn({ name: "inventoryItemId" })
  inventoryItem: InventoryItem

  @Column({ type: "date" })
  forecastDate: Date

  @Column({ type: "int" })
  predictedDemand: number

  @Column({ type: "int" })
  recommendedStock: number

  @Column({ type: "decimal", precision: 5, scale: 2 })
  confidenceLevel: number

  @Column({ type: "json", nullable: true })
  factors: Record<string, any> // Seasonality, trends, etc.

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
