import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { SyncFeeCalculation } from "../../../database/entities/sync-fee-calculation.entity"
import { MediaType, UsageType, Territory } from "../../../database/entities/sync-license.entity"

interface FeeCalculationInput {
  mediaType: MediaType
  usageType: UsageType
  territory: Territory
  durationSeconds?: number
  projectBudget?: number
  exclusivity?: boolean
  trackId: string
}

@Injectable()
export class SyncFeeService {
  constructor(private readonly feeCalculationRepository: Repository<SyncFeeCalculation>) {}

  async calculateFee(input: FeeCalculationInput): Promise<number> {
    // Base fee structure
    const baseFee = 1000 // $1000 base fee

    // Media type multipliers
    const mediaTypeMultipliers = {
      [MediaType.FILM]: 2.0,
      [MediaType.TV_SERIES]: 1.5,
      [MediaType.TV_EPISODE]: 1.2,
      [MediaType.COMMERCIAL]: 3.0,
      [MediaType.DOCUMENTARY]: 1.0,
      [MediaType.WEB_SERIES]: 0.8,
      [MediaType.PODCAST]: 0.5,
      [MediaType.VIDEO_GAME]: 1.8,
      [MediaType.TRAILER]: 1.5,
      [MediaType.OTHER]: 1.0,
    }

    // Usage type multipliers
    const usageTypeMultipliers = {
      [UsageType.BACKGROUND]: 1.0,
      [UsageType.FEATURED]: 2.0,
      [UsageType.THEME]: 3.0,
      [UsageType.OPENING_CREDITS]: 2.5,
      [UsageType.CLOSING_CREDITS]: 2.0,
      [UsageType.MONTAGE]: 1.5,
      [UsageType.PROMOTIONAL]: 1.8,
    }

    // Territory multipliers
    const territoryMultipliers = {
      [Territory.WORLDWIDE]: 3.0,
      [Territory.NORTH_AMERICA]: 2.0,
      [Territory.EUROPE]: 1.8,
      [Territory.ASIA_PACIFIC]: 1.5,
      [Territory.LATIN_AMERICA]: 1.2,
      [Territory.SPECIFIC_COUNTRIES]: 1.0,
    }

    // Calculate multipliers
    const mediaTypeMultiplier = mediaTypeMultipliers[input.mediaType] || 1.0
    const usageTypeMultiplier = usageTypeMultipliers[input.usageType] || 1.0
    const territoryMultiplier = territoryMultipliers[input.territory] || 1.0

    // Duration multiplier (longer usage = higher fee)
    let durationMultiplier = 1.0
    if (input.durationSeconds) {
      if (input.durationSeconds > 180) {
        // > 3 minutes
        durationMultiplier = 2.0
      } else if (input.durationSeconds > 60) {
        // > 1 minute
        durationMultiplier = 1.5
      } else if (input.durationSeconds > 30) {
        // > 30 seconds
        durationMultiplier = 1.2
      }
    }

    // Exclusivity multiplier
    const exclusivityMultiplier = input.exclusivity ? 2.0 : 1.0

    // Budget-based multiplier
    let budgetMultiplier = 1.0
    if (input.projectBudget) {
      if (input.projectBudget > 10000000) {
        // > $10M
        budgetMultiplier = 3.0
      } else if (input.projectBudget > 1000000) {
        // > $1M
        budgetMultiplier = 2.0
      } else if (input.projectBudget > 100000) {
        // > $100K
        budgetMultiplier = 1.5
      }
    }

    // Calculate final fee
    const calculatedFee =
      baseFee *
      mediaTypeMultiplier *
      usageTypeMultiplier *
      territoryMultiplier *
      durationMultiplier *
      exclusivityMultiplier *
      budgetMultiplier

    return Math.round(calculatedFee)
  }

  async createFeeCalculation(
    syncLicenseId: string,
    calculationData: Partial<SyncFeeCalculation>,
  ): Promise<SyncFeeCalculation> {
    const feeCalculation = this.feeCalculationRepository.create({
      ...calculationData,
      syncLicense: { id: syncLicenseId } as any,
    })

    return this.feeCalculationRepository.save(feeCalculation)
  }

  async getFeeCalculations(syncLicenseId: string): Promise<SyncFeeCalculation[]> {
    return this.feeCalculationRepository.find({
      where: { syncLicense: { id: syncLicenseId } },
      order: { createdAt: "DESC" },
    })
  }

  async updateNegotiatedFee(calculationId: string, negotiatedFee: number, notes?: string): Promise<SyncFeeCalculation> {
    const calculation = await this.feeCalculationRepository.findOne({
      where: { id: calculationId },
    })

    if (!calculation) {
      throw new Error("Fee calculation not found")
    }

    calculation.negotiatedFee = negotiatedFee
    calculation.finalFee = negotiatedFee

    if (notes && calculation.calculationDetails) {
      calculation.calculationDetails.notes = notes
    }

    return this.feeCalculationRepository.save(calculation)
  }

  async getFeeStructure(): Promise<any> {
    return {
      baseFee: 1000,
      mediaTypeMultipliers: {
        film: 2.0,
        tv_series: 1.5,
        tv_episode: 1.2,
        commercial: 3.0,
        documentary: 1.0,
        web_series: 0.8,
        podcast: 0.5,
        video_game: 1.8,
        trailer: 1.5,
        other: 1.0,
      },
      usageTypeMultipliers: {
        background: 1.0,
        featured: 2.0,
        theme: 3.0,
        opening_credits: 2.5,
        closing_credits: 2.0,
        montage: 1.5,
        promotional: 1.8,
      },
      territoryMultipliers: {
        worldwide: 3.0,
        north_america: 2.0,
        europe: 1.8,
        asia_pacific: 1.5,
        latin_america: 1.2,
        specific_countries: 1.0,
      },
      additionalFactors: {
        exclusivity: 2.0,
        duration: {
          under_30s: 1.0,
          "30s_to_1m": 1.2,
          "1m_to_3m": 1.5,
          over_3m: 2.0,
        },
        budget: {
          under_100k: 1.0,
          "100k_to_1m": 1.5,
          "1m_to_10m": 2.0,
          over_10m: 3.0,
        },
      },
    }
  }
}
