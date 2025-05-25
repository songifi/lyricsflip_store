import { Controller, Get, Post, Patch, Param, Delete, Query } from "@nestjs/common"
import type { InventoryService } from "../services/inventory.service"
import type { CreateInventoryItemDto } from "../dto/create-inventory-item.dto"
import type { UpdateInventoryItemDto } from "../dto/update-inventory-item.dto"
import type { StockAdjustmentDto } from "../dto/stock-adjustment.dto"
import type { InventoryStatus } from "../../../../database/entities/inventory-item.entity"
import { Body } from "@nestjs/common"

@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: InventoryStatus,
    @Query('lowStock') lowStock?: string,
  ) {
    const filters = {
      category,
      status,
      lowStock: lowStock === "true",
    }
    return this.inventoryService.findAll(filters)
  }

  @Get("low-stock")
  getLowStockItems() {
    return this.inventoryService.getLowStockItems()
  }

  @Get("stock-value")
  getStockValue() {
    return this.inventoryService.getStockValue()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get(":id/turnover")
  getInventoryTurnover(@Param('id') id: string, @Query('days') days?: string) {
    const daysNumber = days ? Number.parseInt(days) : 30
    return this.inventoryService.getInventoryTurnover(id, daysNumber)
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, updateInventoryItemDto)
  }

  @Post('adjust-stock')
  adjustStock(@Body() stockAdjustmentDto: StockAdjustmentDto) {
    return this.inventoryService.adjustStock(stockAdjustmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
