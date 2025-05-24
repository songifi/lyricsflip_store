import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { MerchandiseBundleService } from "../providers/merchandise-bundle.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Role } from "src/common/enums/role.enum";
import { Roles } from "src/common/decorators/roles.decorator";
import { CreateMerchandiseBundleDto } from "../dto/create-merchandise-bundle.dto";
import { UpdateMerchandiseDto } from "../dto/update-merchandise.dto";

@ApiTags("merchandise-bundles")
@Controller("merchandise/bundles")
export class MerchandiseBundleController {
  constructor(private readonly bundleService: MerchandiseBundleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new merchandise bundle' })
  @ApiResponse({ status: 201, description: 'Bundle created successfully' })
  create(@Body() createBundleDto: CreateMerchandiseBundleDto) {
    return this.bundleService.create(createBundleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bundles' })
  @ApiResponse({ status: 200, description: 'Bundles retrieved successfully' })
  findAll(@Query('artistId') artistId?: string) {
    return this.bundleService.findAll(artistId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bundle by ID' })
  @ApiResponse({ status: 200, description: 'Bundle retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bundleService.findOne(id);
  }

  @Get(':id/price')
  @ApiOperation({ summary: 'Calculate bundle price' })
  @ApiResponse({ status: 200, description: 'Bundle price calculated successfully' })
  calculatePrice(@Param('id', ParseUUIDPipe) id: string) {
    return this.bundleService.calculateBundlePrice(id);
  }

  @Get(':id/savings')
  @ApiOperation({ summary: 'Calculate bundle savings' })
  @ApiResponse({ status: 200, description: 'Bundle savings calculated successfully' })
  calculateSavings(@Param('id', ParseUUIDPipe) id: string) {
    return this.bundleService.calculateSavings(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update bundle" })
  @ApiResponse({ status: 200, description: "Bundle updated successfully" })
  @ApiResponse({ status: 404, description: "Bundle not found" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBundleDto: UpdateMerchandiseDto) {
    return this.bundleService.update(id, updateBundleDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete bundle' })
  @ApiResponse({ status: 200, description: 'Bundle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bundleService.remove(id);
  }
}
