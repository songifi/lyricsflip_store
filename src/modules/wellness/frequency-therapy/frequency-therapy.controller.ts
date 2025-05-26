import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common"
import type { FrequencyTherapyService } from "./frequency-therapy.service"
import type { FrequencyType, BrainwaveState } from "../../../database/entities/frequency-therapy.entity"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"

@Controller("wellness/frequency-therapy")
@UseGuards(JwtAuthGuard)
export class FrequencyTherapyController {
  constructor(private readonly frequencyTherapyService: FrequencyTherapyService) {}

  @Get()
  async getAllFrequencies() {
    return this.frequencyTherapyService.getAllFrequencyTherapies()
  }

  @Get('type/:type')
  async getFrequenciesByType(@Param('type') type: FrequencyType) {
    return this.frequencyTherapyService.getFrequenciesByType(type as any);
  }

  @Get('brainwave/:state')
  async getFrequenciesForBrainwave(@Param('state') state: BrainwaveState) {
    return this.frequencyTherapyService.getFrequenciesForBrainwaveState(state);
  }

  @Get('condition/:condition')
  async getFrequenciesForCondition(@Param('condition') condition: string) {
    return this.frequencyTherapyService.getFrequenciesForCondition(condition);
  }

  @Get('binaural-beats/:targetState')
  async getBinauralBeatsRecommendations(@Param('targetState') targetState: BrainwaveState) {
    return this.frequencyTherapyService.getBinauralBeatsRecommendations(targetState);
  }

  @Get("solfeggio")
  async getSolfeggioFrequencies() {
    return this.frequencyTherapyService.getSolfeggioFrequencies()
  }

  @Get("chakra")
  async getChakraFrequencies() {
    return this.frequencyTherapyService.getChakraFrequencies()
  }

  @Post("seed")
  async seedFrequencies() {
    await this.frequencyTherapyService.seedFrequencyTherapies()
    return { message: "Frequency therapies seeded successfully" }
  }
}
