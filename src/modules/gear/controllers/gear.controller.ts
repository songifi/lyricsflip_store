import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ParseUUIDPipe } from "@nestjs/common"
import type { GearService } from "../services/gear.service"
import type { CreateGearDto } from "../dto/create-gear.dto"
import type { UpdateGearDto } from "../dto/update-gear.dto"
import type { GearQueryDto } from "../dto/gear-query.dto"
÷

@Controller("gear")
export class GearController {
  constructor(private readonly gearService: GearService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createGearDto: CreateGearDto, @Request() req: any) {
    return this.gearService.create(createGearDto, req.user.id)
  }

  @Get()
  findAll(@Query() queryDto: GearQueryDto) {
    return this.gearService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gearService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateGearDto: UpdateGearDto, @Request() req: any) {
    return this.gearService.update(id, updateGearDto, req.user.id)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.gearService.remove(id, req.user.id)
  }

  @Post(":id/favorite")
  @UseGuards(JwtAuthGuard)
  toggleFavorite(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.gearService.toggleFavorite(id, req.user.id)
  }
}
