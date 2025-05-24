import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { CreateMerchandiseDto } from "../dto/create-merchandise.dto"
import type { UpdateMerchandiseDto } from "../dto/update-merchandise.dto"
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { MerchandiseService } from "../providers/merchandise.service";
import { QueryMerchandiseDto } from "../dto/query-merchandise.dto";

@ApiTags("merchandise")
@Controller("merchandise")
export class MerchandiseController {
  constructor(private readonly merchandiseService: MerchandiseService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new merchandise' })
  @ApiResponse({ status: 201, description: 'Merchandise created successfully' })
  create(@Body() createMerchandiseDto: CreateMerchandiseDto) {
    return this.merchandiseService.create(createMerchandiseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all merchandise with filters' })
  @ApiResponse({ status: 200, description: 'Merchandise list retrieved successfully' })
  findAll(@Query() queryDto: QueryMerchandiseDto) {
    return this.merchandiseService.findAll(queryDto);
  }

  @Get('inventory/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiResponse({ status: 200, description: 'Inventory report retrieved successfully' })
  getInventoryReport(@Query('artistId') artistId?: string) {
    return this.merchandiseService.getInventoryReport(artistId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchandise by ID' })
  @ApiResponse({ status: 200, description: 'Merchandise retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Merchandise not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.merchandiseService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get merchandise by slug' })
  @ApiResponse({ status: 200, description: 'Merchandise retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Merchandise not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.merchandiseService.findBySlug(slug);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update merchandise" })
  @ApiResponse({ status: 200, description: "Merchandise updated successfully" })
  @ApiResponse({ status: 404, description: "Merchandise not found" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMerchandiseDto: UpdateMerchandiseDto) {
    return this.merchandiseService.update(id, updateMerchandiseDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete merchandise' })
  @ApiResponse({ status: 200, description: 'Merchandise deleted successfully' })
  @ApiResponse({ status: 404, description: 'Merchandise not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.merchandiseService.remove(id);
  }

  @Patch(":variantId/inventory")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update inventory for a variant" })
  @ApiResponse({ status: 200, description: "Inventory updated successfully" })
  updateInventory(@Param('variantId', ParseUUIDPipe) variantId: string, @Body('quantity') quantity: number) {
    return this.merchandiseService.updateInventory(variantId, quantity)
  }

  @Post(":variantId/reserve")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reserve inventory for a variant" })
  @ApiResponse({ status: 200, description: "Inventory reserved successfully" })
  reserveInventory(@Param('variantId', ParseUUIDPipe) variantId: string, @Body('quantity') quantity: number) {
    return this.merchandiseService.reserveInventory(variantId, quantity)
  }

  @Post(":variantId/release")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Release reserved inventory for a variant" })
  @ApiResponse({ status: 200, description: "Inventory released successfully" })
  releaseInventory(@Param('variantId', ParseUUIDPipe) variantId: string, @Body('quantity') quantity: number) {
    return this.merchandiseService.releaseInventory(variantId, quantity)
  }
}
