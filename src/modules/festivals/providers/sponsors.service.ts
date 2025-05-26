import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Sponsor, SponsorStatus, SponsorTier } from "../../database/entities/sponsor.entity"

@Injectable()
export class SponsorsService {
  constructor(private sponsorRepository: Repository<Sponsor>) {}

  async getFestivalSponsors(festivalId: string): Promise<Sponsor[]> {
    return await this.sponsorRepository.find({
      where: { festivalId },
      order: { tier: "ASC", sponsorshipValue: "DESC" },
    })
  }

  async getSponsorsByTier(festivalId: string, tier: SponsorTier): Promise<Sponsor[]> {
    return await this.sponsorRepository.find({
      where: { festivalId, tier },
      order: { sponsorshipValue: "DESC" },
    })
  }

  async updateSponsorStatus(id: string, status: SponsorStatus): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findOne({ where: { id } })
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID ${id} not found`)
    }

    sponsor.status = status
    return await this.sponsorRepository.save(sponsor)
  }

  async getSponsorshipAnalytics(festivalId: string) {
    const sponsors = await this.getFestivalSponsors(festivalId)

    const analytics = {
      totalSponsors: sponsors.length,
      totalValue: 0,
      byTier: {},
      byStatus: {},
      averageValue: 0,
    }

    sponsors.forEach((sponsor) => {
      // Count by tier
      analytics.byTier[sponsor.tier] = (analytics.byTier[sponsor.tier] || 0) + 1

      // Count by status
      analytics.byStatus[sponsor.status] = (analytics.byStatus[sponsor.status] || 0) + 1

      // Calculate total value
      analytics.totalValue += sponsor.sponsorshipValue
    })

    analytics.averageValue = analytics.totalValue / sponsors.length || 0

    return analytics
  }

  async getDeliverableStatus(festivalId: string) {
    const sponsors = await this.getFestivalSponsors(festivalId)

    const deliverables = sponsors.flatMap((sponsor) =>
      (sponsor.deliverables || []).map((deliverable) => ({
        sponsorName: sponsor.name,
        sponsorTier: sponsor.tier,
        ...deliverable,
      })),
    )

    return {
      total: deliverables.length,
      pending: deliverables.filter((d) => d.status === "pending").length,
      inProgress: deliverables.filter((d) => d.status === "in_progress").length,
      completed: deliverables.filter((d) => d.status === "completed").length,
      deliverables,
    }
  }
}
