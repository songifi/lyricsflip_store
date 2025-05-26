import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { FrequencyTherapy, FrequencyType, BrainwaveState } from "../../../database/entities/frequency-therapy.entity"

@Injectable()
export class FrequencyTherapyService {
  private frequencyTherapyRepository: Repository<FrequencyTherapy>

  constructor(
    @InjectRepository(FrequencyTherapy)
    frequencyTherapyRepository: Repository<FrequencyTherapy>,
  ) {
    this.frequencyTherapyRepository = frequencyTherapyRepository;
  }

  async getAllFrequencyTherapies(): Promise<FrequencyTherapy[]> {
    return this.frequencyTherapyRepository.find({
      where: { isActive: true },
      order: { type: "ASC", frequency: "ASC" },
    })
  }

  async getFrequenciesByType(type: FrequencyType): Promise<FrequencyTherapy[]> {
    return this.frequencyTherapyRepository.find({
      where: { type, isActive: true },
      order: { frequency: "ASC" },
    })
  }

  async getFrequenciesForBrainwaveState(state: BrainwaveState): Promise<FrequencyTherapy[]> {
    return this.frequencyTherapyRepository.find({
      where: { targetBrainwaveState: state, isActive: true },
      order: { frequency: "ASC" },
    })
  }

  async getFrequenciesForCondition(condition: string): Promise<FrequencyTherapy[]> {
    return this.frequencyTherapyRepository
      .createQueryBuilder("frequency")
      .where("frequency.isActive = :isActive", { isActive: true })
      .andWhere(":condition = ANY(frequency.targetConditions)", { condition })
      .orderBy("frequency.frequency", "ASC")
      .getMany()
  }

  async createFrequencyTherapy(therapyData: Partial<FrequencyTherapy>): Promise<FrequencyTherapy> {
    const therapy = this.frequencyTherapyRepository.create(therapyData)
    return this.frequencyTherapyRepository.save(therapy)
  }

  async getBinauralBeatsRecommendations(targetState: BrainwaveState): Promise<FrequencyTherapy[]> {
    const frequencyRanges = {
      [BrainwaveState.DELTA]: { min: 0.5, max: 4 },
      [BrainwaveState.THETA]: { min: 4, max: 8 },
      [BrainwaveState.ALPHA]: { min: 8, max: 13 },
      [BrainwaveState.BETA]: { min: 13, max: 30 },
      [BrainwaveState.GAMMA]: { min: 30, max: 100 },
    }

    const range = frequencyRanges[targetState]

    return this.frequencyTherapyRepository
      .createQueryBuilder("frequency")
      .where("frequency.type = :type", { type: FrequencyType.BINAURAL_BEATS })
      .andWhere("frequency.frequency >= :minFreq AND frequency.frequency <= :maxFreq", {
        minFreq: range.min,
        maxFreq: range.max,
      })
      .andWhere("frequency.isActive = :isActive", { isActive: true })
      .orderBy("frequency.frequency", "ASC")
      .getMany()
  }

  async getSolfeggioFrequencies(): Promise<FrequencyTherapy[]> {
    return this.frequencyTherapyRepository.find({
      where: { type: FrequencyType.SOLFEGGIO, isActive: true },
      order: { frequency: "ASC" },
    })
  }

  async getChakraFrequencies(): Promise<FrequencyTherapy[]> {
    return this.frequencyTherapyRepository.find({
      where: { type: FrequencyType.CHAKRA_FREQUENCIES, isActive: true },
      order: { frequency: "ASC" },
    })
  }

  // Predefined frequency therapy data
  async seedFrequencyTherapies(): Promise<void> {
    const therapies = [
      // Binaural Beats
      {
        name: "Deep Sleep Delta",
        description: "Promotes deep, restorative sleep",
        type: FrequencyType.BINAURAL_BEATS,
        frequency: 2.5,
        targetBrainwaveState: BrainwaveState.DELTA,
        benefits: ["Deep sleep", "Physical healing", "Regeneration"],
        targetConditions: ["insomnia", "sleep_disorders", "recovery"],
        scientificBasis: "Delta waves are associated with deep sleep and healing processes",
        recommendedDurationMinutes: 60,
        contraindications: ["epilepsy", "pregnancy"],
        usageInstructions: ["Use stereo headphones", "Listen in quiet environment", "Use before bedtime"],
      },
      {
        name: "Theta Meditation",
        description: "Enhances deep meditation and creativity",
        type: FrequencyType.BINAURAL_BEATS,
        frequency: 6,
        targetBrainwaveState: BrainwaveState.THETA,
        benefits: ["Deep meditation", "Enhanced creativity", "Emotional healing"],
        targetConditions: ["meditation", "creativity_block", "emotional_trauma"],
        scientificBasis: "Theta waves are present during deep meditation and REM sleep",
        recommendedDurationMinutes: 30,
        contraindications: ["epilepsy"],
        usageInstructions: ["Use stereo headphones", "Meditate or relax", "Close eyes"],
      },
      // Solfeggio Frequencies
      {
        name: "528 Hz - Love Frequency",
        description: "The frequency of love and DNA repair",
        type: FrequencyType.SOLFEGGIO,
        frequency: 528,
        benefits: ["DNA repair", "Love and compassion", "Healing"],
        targetConditions: ["emotional_healing", "self_love", "relationships"],
        scientificBasis: "Research suggests 528 Hz may have healing properties on DNA",
        recommendedDurationMinutes: 20,
        usageInstructions: ["Can be used with or without headphones", "Focus on heart center"],
      },
      {
        name: "432 Hz - Natural Harmony",
        description: "The natural frequency of the universe",
        type: FrequencyType.SOLFEGGIO,
        frequency: 432,
        benefits: ["Natural harmony", "Reduced anxiety", "Mental clarity"],
        targetConditions: ["anxiety", "stress", "mental_fog"],
        scientificBasis: "Considered mathematically consistent with the universe",
        recommendedDurationMinutes: 15,
        usageInstructions: ["Listen during daily activities", "Use for background music"],
      },
      // Chakra Frequencies
      {
        name: "Root Chakra - 396 Hz",
        description: "Grounding and security",
        type: FrequencyType.CHAKRA_FREQUENCIES,
        frequency: 396,
        benefits: ["Grounding", "Security", "Stability"],
        targetConditions: ["anxiety", "insecurity", "fear"],
        scientificBasis: "Associated with the root chakra in traditional healing",
        recommendedDurationMinutes: 15,
        usageInstructions: ["Focus on base of spine", "Visualize red energy"],
      },
    ]

    for (const therapy of therapies) {
      const existing = await this.frequencyTherapyRepository.findOne({
        where: { name: therapy.name },
      })

      if (!existing) {
        await this.createFrequencyTherapy(therapy)
      }
    }
  }
}
