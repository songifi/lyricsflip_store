import { Controller, Get, Post, Body, Param, UseGuards, Request } from "@nestjs/common"
import type { WellnessService } from "./wellness.service"
import type { CreateWellnessProgramDto } from "./dto/create-wellness-program.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"

@Controller("wellness")
@UseGuards(JwtAuthGuard)
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  @Get("categories")
  async getCategories() {
    return this.wellnessService.getAllCategories()
  }

  @Get("programs")
  async getPrograms() {
    return this.wellnessService.getAllPrograms()
  }

  @Get('programs/category/:categoryId')
  async getProgramsByCategory(@Param('categoryId') categoryId: string) {
    return this.wellnessService.getProgramsByCategory(categoryId);
  }

  @Post('programs')
  async createProgram(@Body() programData: CreateWellnessProgramDto) {
    return this.wellnessService.createProgram(programData);
  }

  @Get('progress')
  async getUserProgress(@Request() req) {
    return this.wellnessService.getUserProgress(req.user.id);
  }

  @Post("programs/:programId/start")
  async startProgram(@Param('programId') programId: string, @Request() req) {
    return this.wellnessService.startProgram(req.user.id, programId)
  }

  @Get('stats')
  async getWellnessStats(@Request() req) {
    return this.wellnessService.getWellnessStats(req.user.id);
  }
}
