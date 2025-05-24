import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { UpdateGenreDto } from '../dto/update-genre.dto';
import { GenreQueryDto } from '../dto/genre-query.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GenreService } from '../providers/genres.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GenreResponseDto } from '../dto/genre-response.dto';
import { GenreTreeResponseDto } from '../dto/genreTreeResponse.dto';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Genres')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new genre' })
  @ApiResponse({
    status: 201,
    description: 'Genre created successfully',
    type: GenreResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Genre with this name already exists' })
  async create(@Body() createGenreDto: CreateGenreDto): Promise<GenreResponseDto> {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all genres with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Genres retrieved successfully',
    type: GenreTreeResponseDto,
  })
  async findAll(@Query() query: GenreQueryDto): Promise<GenreTreeResponseDto> {
    return this.genreService.findAll(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending genres' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of trending genres to return',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Trending genres retrieved successfully',
    type: [GenreResponseDto],
  })
  async getTrending(@Query('limit', ParseIntPipe) limit: number = 10): Promise<GenreResponseDto[]> {
    return this.genreService.getTrendingGenres(limit);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get genre tree structure' })
  @ApiQuery({
    name: 'rootId',
    required: false,
    type: String,
    description: 'Root genre ID to start the tree from',
  })
  @ApiResponse({
    status: 200,
    description: 'Genre tree retrieved successfully',
  })
  async getTree(@Query('rootId') rootId?: string) {
    return this.genreService.getGenreTree(rootId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get genre by ID' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @ApiResponse({
    status: 200,
    description: 'Genre retrieved successfully',
    type: GenreResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GenreResponseDto> {
    return this.genreService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get genre by slug' })
  @ApiParam({ name: 'slug', description: 'Genre slug' })
  @ApiResponse({
    status: 200,
    description: 'Genre retrieved successfully',
    type: GenreResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async findBySlug(@Param('slug') slug: string): Promise<GenreResponseDto> {
    return this.genreService.findBySlug(slug);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get genre ancestors (parent chain)' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @ApiResponse({
    status: 200,
    description: 'Genre ancestors retrieved successfully',
    type: [GenreResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async getAncestors(@Param('id', ParseUUIDPipe) id: string) {
    return this.genreService.getGenreAncestors(id);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get genre descendants (children tree)' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @ApiResponse({
    status: 200,
    description: 'Genre descendants retrieved successfully',
    type: [GenreResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async getDescendants(@Param('id', ParseUUIDPipe) id: string) {
    return this.genreService.getGenreDescendants(id);
  }

  @Get(':id/popularity-history')
  @ApiOperation({ summary: 'Get genre popularity history' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look back',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Genre popularity history retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async getPopularityHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days', ParseIntPipe) days: number = 30,
  ) {
    return this.genreService.getPopularityHistory(id, days);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update genre' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @ApiResponse({
    status: 200,
    description: 'Genre updated successfully',
    type: GenreResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data or circular reference' })
  @ApiConflictResponse({ description: 'Genre with this name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ): Promise<GenreResponseDto> {
    return this.genreService.update(id, updateGenreDto);
  }

  @Patch(':id/popularity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SYSTEM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update genre popularity metrics' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Genre popularity updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async updatePopularity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { trackCount: number; streamCount: number },
  ): Promise<void> {
    return this.genreService.updatePopularity(id, body.trackCount, body.streamCount);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete genre (soft delete)' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Genre deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  @ApiBadRequestResponse({ description: 'Cannot delete genre with children' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.genreService.remove(id);
  }
}