import { Controller, Get, Post, Body, Patch, Param, Query } from "@nestjs/common"
import type { BatchService } from "../services/batch.service"
import type { CreateBatchDto } from "../dto/create-batch.dto"
import type { BatchStatus } from "../../../../database/entities/inventory-batch.entity"

@Controller("batches")
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.create(createBatchDto);
  }

  @Get()
  findAll(
    @Query('inventoryItemId') inventoryItemId?: string,
    @Query('status') status?: BatchStatus,
    @Query('expiringSoon') expiringSoon?: string,
  ) {
    const filters = {
      inventoryItemId,
      status,
      expiringSoon: expiringSoon === "true",
    }
    return this.batchService.findAll(filters)
  }

  @Get('expiring')
  getExpiringBatches(@Query('days') days?: string) {
    const daysNumber = days ? Number.parseInt(days) : 30;
    return this.batchService.getExpiringBatches(daysNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Patch(":id/status")
  updateStatus(@Param('id') id: string, @Body() body: { status: BatchStatus; reason?: string }) {
    return this.batchService.updateBatchStatus(id, body.status, body.reason)
  }

  @Post('allocate')
  allocateStock(
    @Body() body: { inventoryItemId: string; quantity: number }
  ) {
    return this.batchService.allocateStock(body.inventoryItemId, body.quantity);
  }

  @Post(":id/confirm-allocation")
  confirmAllocation(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.batchService.confirmAllocation(id, body.quantity)
  }
}
