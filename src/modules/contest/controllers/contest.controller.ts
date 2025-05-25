import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from "@nestjs/common"
import type { ContestService } from "../services/contest.service"
import type { CreateContestDto } from "../dto/create-contest.dto"
import type { UpdateContestDto } from "../dto/update-contest.dto"
import type { PaginationDto } from "../../../common/dto/pagination.dto"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags("contests")
@Controller("contests")
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new contest" })
  create(@Body() createContestDto: CreateContestDto, @Request() req) {
    return this.contestService.create(createContestDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: "Get all contests with pagination and filters" })
  findAll(@Query() paginationDto: PaginationDto, @Query() filters: any) {
    return this.contestService.findAll(paginationDto, filters)
  }

  @Get("featured")
  @ApiOperation({ summary: "Get featured contests" })
  getFeatured() {
    return this.contestService.getFeaturedContests()
  }

  @Get("active")
  @ApiOperation({ summary: "Get active contests" })
  getActive() {
    return this.contestService.getActiveContests()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contest by ID' })
  findOne(@Param('id') id: string) {
    return this.contestService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get contest statistics' })
  getStats(@Param('id') id: string) {
    return this.contestService.getContestStats(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update contest" })
  update(@Param('id') id: string, @Body() updateContestDto: UpdateContestDto, @Request() req) {
    return this.contestService.update(id, updateContestDto, req.user.id)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete contest" })
  remove(@Param('id') id: string, @Request() req) {
    return this.contestService.remove(id, req.user.id)
  }
}
