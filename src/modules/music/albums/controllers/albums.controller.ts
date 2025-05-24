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
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AlbumsService } from '../providers/albums.service';
import { CreateAlbumDto } from '../dto/create-album.dto';
import { AlbumQueryDto } from '../dto/albumQuery.dto';
import { UpdateAlbumDto } from '../dto/update-album.dto';
import { AlbumStatus } from '../enums/albumStatus.enum';
import { CreateAlbumCreditDto } from '../dto/createAlbumCredit.dto';
import { CreateAlbumArtworkDto } from '../dto/createAlbumArtwork.dto';

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAlbumDto: CreateAlbumDto) {
    return await this.albumsService.create(createAlbumDto);
  }

  @Get()
  async findAll(@Query() queryDto: AlbumQueryDto) {
    return await this.albumsService.findAll(queryDto);
  }

  @Get('search')
  async search(@Query('q') query: string, @Query('limit') limit?: number) {
    return await this.albumsService.searchAlbums(query, limit);
  }

  @Get('popular')
  async getPopular(@Query('limit') limit?: number) {
    return await this.albumsService.getPopularAlbums(limit);
  }

  @Get('recent-releases')
  async getRecentReleases(@Query('limit') limit?: number) {
    return await this.albumsService.getRecentReleases(limit);
  }

  @Get('upcoming-releases')
  async getUpcomingReleases(@Query('limit') limit?: number) {
    return await this.albumsService.getUpcomingReleases(limit);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.albumsService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.albumsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    return await this.albumsService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.albumsService.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AlbumStatus,
  ) {
    return await this.albumsService.updateStatus(id, status);
  }

  @Post(':id/play')
  @HttpCode(HttpStatus.OK)
  async incrementPlayCount(@Param('id', ParseUUIDPipe) id: string) {
    await this.albumsService.incrementPlayCount(id);
    return { message: 'Play count incremented' };
  }

  @Post(':id/download')
  @HttpCode(HttpStatus.OK)
  async incrementDownloadCount(@Param('id', ParseUUIDPipe) id: string) {
    await this.albumsService.incrementDownloadCount(id);
    return { message: 'Download count incremented' };
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async incrementLikeCount(@Param('id', ParseUUIDPipe) id: string) {
    await this.albumsService.incrementLikeCount(id);
    return { message: 'Like count incremented' };
  }

  // Album Credits endpoints
  @Get(':id/credits')
  async getCredits(@Param('id', ParseUUIDPipe) id: string) {
    return await this.albumsService.getCredits(id);
  }

  @Post(':id/credits')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async addCredit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() creditDto: CreateAlbumCreditDto,
  ) {
    return await this.albumsService.addCredit(id, creditDto);
  }

  @Patch('credits/:creditId')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  async updateCredit(
    @Param('creditId', ParseUUIDPipe) creditId: string,
    @Body() creditDto: Partial<CreateAlbumCreditDto>,
  ) {
    return await this.albumsService.updateCredit(creditId, creditDto);
  }

  @Delete('credits/:creditId')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCredit(@Param('creditId', ParseUUIDPipe) creditId: string) {
    await this.albumsService.removeCredit(creditId);
  }

  // Album Artwork endpoints
  @Get(':id/artwork')
  async getArtwork(@Param('id', ParseUUIDPipe) id: string) {
    return await this.albumsService.getArtwork(id);
  }

  @Get(':id/artwork/primary')
  async getPrimaryArtwork(@Param('id', ParseUUIDPipe) id: string) {
    return await this.albumsService.getPrimaryArtwork(id);
  }

  @Post(':id/artwork')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async addArtwork(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() artworkDto: CreateAlbumArtworkDto,
  ) {
    return await this.albumsService.addArtwork(id, artworkDto);
  }

  @Patch('artwork/:artworkId')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  async updateArtwork(
    @Param('artworkId', ParseUUIDPipe) artworkId: string,
    @Body() artworkDto: Partial<CreateAlbumArtworkDto>,
  ) {
    return await this.albumsService.updateArtwork(artworkId, artworkDto);
  }

  @Delete('artwork/:artworkId')
  @UseGuards(RolesGuard)
  @Roles('artist', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeArtwork(@Param('artworkId', ParseUUIDPipe) artworkId: string) {
    await this.albumsService.removeArtwork(artworkId);
  }
}