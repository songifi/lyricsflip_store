import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { MerchandiseCategoryService } from "../providers/merchandise-category.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { CreateMerchandiseCategoryDto } from "../dto/create-merchandise-category.dto";
import { UpdateMerchandiseDto } from "../dto/update-merchandise.dto";

@ApiTags("merchandise-categories")
@Controller("merchandise/categories")
export class MerchandiseCategoryController {
  constructor(private readonly categoryService: MerchandiseCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new merchandise category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@Body() createCategoryDto: CreateMerchandiseCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all categories as tree structure" })
  @ApiResponse({ status: 200, description: "Categories retrieved successfully" })
  findAll() {
    return this.categoryService.findAll()
  }

  @Get("roots")
  @ApiOperation({ summary: "Get root categories" })
  @ApiResponse({ status: 200, description: "Root categories retrieved successfully" })
  findRoots() {
    return this.categoryService.findRoots()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get category descendants' })
  @ApiResponse({ status: 200, description: 'Descendants retrieved successfully' })
  findDescendants(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findDescendants(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update category" })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateMerchandiseDto) {
    return this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
