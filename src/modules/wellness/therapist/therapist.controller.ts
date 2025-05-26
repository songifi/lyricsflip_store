import { Controller, Get, Put, Body, Param, Query, UseGuards } from "@nestjs/common"
import type { TherapistService } from "./therapist.service"
import type { TherapistSpecialty, CertificationLevel } from "../../../database/entities/therapist-profile.entity"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"

@Controller("wellness/therapists")
@UseGuards(JwtAuthGuard)
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  @Get()
  async getAllTherapists() {
    return this.therapistService.getAllTherapists()
  }

  @Get('specialty/:specialty')
  async getTherapistsBySpecialty(@Param('specialty') specialty: string) {
    return this.therapistService.getTherapistsBySpecialty(specialty);
  }

  @Get("search")
  async searchTherapists(
    @Query('specialties') specialties?: string,
    @Query('certificationLevel') certificationLevel?: CertificationLevel,
    @Query('minRating') minRating?: number,
    @Query('languages') languages?: string,
    @Query('minExperience') minExperience?: number,
  ) {
    const criteria = {
      specialties: specialties ? (specialties.split(",") as TherapistSpecialty[]) : undefined,
      certificationLevel,
      minRating,
      languages: languages ? languages.split(",") : undefined,
      minExperience,
    }

    return this.therapistService.searchTherapists(criteria)
  }

  @Get(':id')
  async getTherapistById(@Param('id') id: string) {
    return this.therapistService.getTherapistById(id);
  }

  @Put(":id/rating")
  async updateRating(@Param('id') id: string, @Body('rating') rating: number) {
    return this.therapistService.updateTherapistRating(id, rating)
  }
}
