import { Controller, Get, Post, Body, Patch, Param, Query } from "@nestjs/common"
import type { PurchaseOrderService } from "../services/purchase-order.service"
import type { CreatePurchaseOrderDto } from "../dto/create-purchase-order.dto"
import type { PurchaseOrderStatus } from "../../../../database/entities/purchase-order.entity"

@Controller("purchase-orders")
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrderService.create(createPurchaseOrderDto);
  }

  @Get()
  findAll(@Query('status') status?: PurchaseOrderStatus, @Query('supplierId') supplierId?: string) {
    const filters = { status, supplierId }
    return this.purchaseOrderService.findAll(filters)
  }

  @Get("reorder-suggestions")
  getReorderSuggestions() {
    return this.purchaseOrderService.generateReorderSuggestions()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  @Patch(":id/status")
  updateStatus(@Param('id') id: string, @Body() body: { status: PurchaseOrderStatus; approvedBy?: string }) {
    return this.purchaseOrderService.updateStatus(id, body.status, body.approvedBy)
  }

  @Post(":id/receive")
  receiveItems(@Param('id') id: string, @Body() body: { items: Array<{ itemId: string; quantityReceived: number }> }) {
    return this.purchaseOrderService.receiveItems(id, body.items)
  }
}
