import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Vendor, type VendorStatus, type VendorType } from "../../database/entities/vendor.entity"

@Injectable()
export class VendorsService {
  private vendorRepository: Repository<Vendor>

  constructor(
    @InjectRepository(Vendor)
    vendorRepository: Repository<Vendor>,
  ) {
    this.vendorRepository = vendorRepository;
  }

  async getFestivalVendors(festivalId: string): Promise<Vendor[]> {
    return await this.vendorRepository.find({
      where: { festivalId },
      order: { type: "ASC", name: "ASC" },
    })
  }

  async getVendorsByType(festivalId: string, type: VendorType): Promise<Vendor[]> {
    return await this.vendorRepository.find({
      where: { festivalId, type },
      order: { name: "ASC" },
    })
  }

  async updateVendorStatus(id: string, status: VendorStatus): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id } })
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`)
    }

    vendor.status = status
    return await this.vendorRepository.save(vendor)
  }

  async getVendorAnalytics(festivalId: string) {
    const vendors = await this.getFestivalVendors(festivalId)

    const analytics = {
      totalVendors: vendors.length,
      byType: {},
      byStatus: {},
      totalRevenue: 0,
      averageFee: 0,
    }

    vendors.forEach((vendor) => {
      // Count by type
      analytics.byType[vendor.type] = (analytics.byType[vendor.type] || 0) + 1

      // Count by status
      analytics.byStatus[vendor.status] = (analytics.byStatus[vendor.status] || 0) + 1

      // Calculate revenue
      if (vendor.fee) {
        analytics.totalRevenue += vendor.fee
      }
    })

    analytics.averageFee = analytics.totalRevenue / vendors.length || 0

    return analytics
  }
}
