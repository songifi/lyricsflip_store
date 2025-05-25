import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common"
import type { SupplierService } from "../services/supplier.service"
import type { CreateSupplierDto } from "../dto/create-supplier.dto"
import type { UpdateSupplierDto } from "../dto/update-supplier.dto"

@Controller("suppliers")
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.supplierService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Get(':id/performance')
  getSupplierPerformance(@Param('id') id: string) {
    return this.supplierService.getSupplierPerformance(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}
