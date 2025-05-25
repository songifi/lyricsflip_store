import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from "@nestjs/common"
import type { PodcastsService } from "../services/podcasts.service"
import type { CreatePodcastDto } from "../dto/create-podcast.dto"
import type { UpdatePodcastDto } from "../dto/update-podcast.dto"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"

@Controller("podcasts")
export class PodcastsController {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPodcastDto: CreatePodcastDto, @Request() req: any) {
    return this.podcastsService.create(createPodcastDto, req.user.id)
  }

  @Get()
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.podcastsService.findAll(Number.parseInt(page), Number.parseInt(limit))
  }

  @Get("my-podcasts")
  @UseGuards(JwtAuthGuard)
  findMyPodcasts(@Request() req, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.podcastsService.findByOwner(req.user.id, Number.parseInt(page), Number.parseInt(limit))
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.podcastsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePodcastDto: UpdatePodcastDto, @Request() req) {
    return this.podcastsService.update(id, updatePodcastDto, req.user.id)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.podcastsService.remove(id, req.user.id)
  }

  @Post(":id/publish")
  @UseGuards(JwtAuthGuard)
  publish(@Param('id') id: string, @Request() req) {
    return this.podcastsService.publish(id, req.user.id)
  }

  @Post(":id/archive")
  @UseGuards(JwtAuthGuard)
  archive(@Param('id') id: string, @Request() req) {
    return this.podcastsService.archive(id, req.user.id)
  }
}
