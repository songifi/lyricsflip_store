import { IsString, IsOptional, IsDateString, IsUUID, IsArray, ValidateNested, IsNumber, Min } from "class-validator"
import { Type } from "class-transformer"

export class PurchaseOrderItemDto {
  @IsUUID()
  inventoryItemId: string

  @IsNumber()
  @Min(1)
  quantityOrdered: number

  @IsNumber()
  @Min(0)
  unitPrice: number
}

export class CreatePurchaseOrderDto {
  @IsString()
  orderNumber: string

  @IsUUID()
  supplierId: string

  @IsOptional()
  @IsDateString()
  orderDate?: string

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string

  @IsString()
  createdBy: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[]
}
