import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type RegionalLicense, LicenseType, LicenseStatus } from "../entities/regional-license.entity"
import type { CulturePreference } from "../entities/culture-preference.entity"

export interface RegionalAvailability {
  isAvailable: boolean
  licenses: RegionalLicense[]
  restrictions?: string[]
}

export interface CulturalRecommendation {
  entityId: string
  entityType: string
  score: number
  reasons: string[]
}

@Injectable()
export class LocalizationService {
  constructor(
    private regionalLicenseRepository: Repository<RegionalLicense>,
    private culturePreferenceRepository: Repository<CulturePreference>,
  ) {}

  async checkRegionalAvailability(
    entityId: string,
    entityType: string,
    region: string,
    licenseType: LicenseType = LicenseType.STREAMING,
  ): Promise<RegionalAvailability> {
    const licenses = await this.regionalLicenseRepository.find({
      where: {
        entityId,
        entityType,
        region,
        licenseType,
        status: LicenseStatus.ACTIVE,
      },
    })

    const activeLicenses = licenses.filter((license) => {
      const now = new Date()
      return (!license.validFrom || license.validFrom <= now) && (!license.validUntil || license.validUntil >= now)
    })

    const restrictions = activeLicenses
      .map((license) => license.restrictions)
      .filter(Boolean)
      .flatMap((restriction) => Object.keys(restriction || {}))

    return {
      isAvailable: activeLicenses.length > 0,
      licenses: activeLicenses,
      restrictions: restrictions.length > 0 ? restrictions : undefined,
    }
  }

  async createRegionalLicense(licenseData: Partial<RegionalLicense>): Promise<RegionalLicense> {
    const license = this.regionalLicenseRepository.create(licenseData)
    return this.regionalLicenseRepository.save(license)
  }

  async updateRegionalLicense(id: string, updates: Partial<RegionalLicense>): Promise<RegionalLicense> {
    await this.regionalLicenseRepository.update(id, updates)
    const updated = await this.regionalLicenseRepository.findOne({
      where: { id },
    })

    if (!updated) {
      throw new Error("License not found")
    }

    return updated
  }

  async getCulturalRecommendations(userId: string, entityType: string, limit = 20): Promise<CulturalRecommendation[]> {
    const userPreferences = await this.culturePreferenceRepository.findOne({
      where: { userId },
    })

    if (!userPreferences) {
      return []
    }

    // This is a simplified recommendation algorithm
    // In a real implementation, you would use more sophisticated ML algorithms
    const recommendations: CulturalRecommendation[] = []

    // Mock recommendations based on cultural preferences
    const { genrePreferences, culturalTags, region } = userPreferences

    // Generate mock recommendations
    for (let i = 0; i < limit; i++) {
      const score = Math.random() * 100
      const reasons = []

      if (genrePreferences?.length) {
        reasons.push(`Matches your preferred genres: ${genrePreferences.slice(0, 2).join(", ")}`)
      }

      if (culturalTags?.length) {
        reasons.push(`Popular in your cultural context: ${culturalTags[0]}`)
      }

      reasons.push(`Trending in ${region}`)

      recommendations.push({
        entityId: `mock-entity-${i}`,
        entityType,
        score,
        reasons,
      })
    }

    return recommendations.sort((a, b) => b.score - a.score)
  }

  async getRegionalLicenses(entityId: string, entityType: string): Promise<RegionalLicense[]> {
    return this.regionalLicenseRepository.find({
      where: { entityId, entityType },
      order: { region: "ASC", licenseType: "ASC" },
    })
  }

  async bulkUpdateLicenseStatus(
    entityId: string,
    entityType: string,
    status: LicenseStatus,
    regions?: string[],
  ): Promise<void> {
    const whereCondition: any = { entityId, entityType }

    if (regions?.length) {
      whereCondition.region = regions
    }

    await this.regionalLicenseRepository.update(whereCondition, { status })
  }

  getTimeZoneByRegion(region: string): string {
    const timezoneMap: Record<string, string> = {
      US: "America/New_York",
      CA: "America/Toronto",
      GB: "Europe/London",
      DE: "Europe/Berlin",
      FR: "Europe/Paris",
      IT: "Europe/Rome",
      ES: "Europe/Madrid",
      JP: "Asia/Tokyo",
      KR: "Asia/Seoul",
      CN: "Asia/Shanghai",
      AU: "Australia/Sydney",
      BR: "America/Sao_Paulo",
      MX: "America/Mexico_City",
      IN: "Asia/Kolkata",
    }

    return timezoneMap[region.toUpperCase()] || "UTC"
  }
}
