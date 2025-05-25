import { IsNumber, IsString, IsOptional, IsEnum, IsUUID } from "class-validator"
import { AuditType } from "../../../../database/entities/inventory-audit.entity"

export class StockAdjustmentDto {
  @IsUUID()
  inventoryItemId: string

  @IsNumber()
  quantityChanged: number

  @IsEnum(AuditType)
  type: AuditType

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsString()
  reference?: string

  @IsString()
  performedBy: string

  @IsOptional()
  metadata?: Record<string, any>
}
