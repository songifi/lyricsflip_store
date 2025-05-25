import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsUUID, Min } from "class-validator"
import { BatchStatus } from "../../../../database/entities/inventory-batch.entity"

export class CreateBatchDto {
  @IsString()
  batchNumber: string

  @IsOptional()
  @IsString()
  lotNumber?: string

  @IsUUID()
  inventoryItemId: string

  @IsNumber()
  @Min(1)
  quantity: number

  @IsNumber()
  @Min(0)
  costPrice: number

  @IsOptional()
  @IsDateString()
  manufacturingDate?: string

  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @IsDateString()
  receivedDate: string

  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus

  @IsOptional()
  @IsString()
  notes?: string
}
