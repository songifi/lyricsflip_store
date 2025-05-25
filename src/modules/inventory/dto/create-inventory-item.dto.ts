import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min } from "class-validator"
import { InventoryStatus } from "../../../../database/entities/inventory-item.entity"

export class CreateInventoryItemDto {
  @IsString()
  sku: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  category: string

  @IsNumber()
  @Min(0)
  unitPrice: number

  @IsNumber()
  @Min(0)
  costPrice: number

  @IsNumber()
  @Min(0)
  currentStock: number

  @IsNumber()
  @Min(0)
  minimumStock: number

  @IsNumber()
  @Min(0)
  maximumStock: number

  @IsNumber()
  @Min(0)
  reorderPoint: number

  @IsNumber()
  @Min(0)
  reorderQuantity: number

  @IsOptional()
  @IsString()
  unit?: string

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus

  @IsOptional()
  @IsUUID()
  supplierId?: string

  @IsOptional()
  metadata?: Record<string, any>
}
