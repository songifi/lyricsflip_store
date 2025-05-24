import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CreateMerchandiseBundleDto } from "../dto/create-merchandise-bundle.dto"
import { MerchandiseService } from "./merchandise.service"
import { MerchandiseBundle } from "../entities/merchandise-bundle.entity"
import { MerchandiseBundleItem } from "../entities/merchandise-bundle-item.entity"
import { UpdateMerchandiseDto } from "../dto/update-merchandise.dto"

@Injectable()
export class MerchandiseBundleService {
  constructor(
    private merchandiseService: MerchandiseService,
    @InjectRepository(MerchandiseBundle)
    private bundleRepository: Repository<MerchandiseBundle>,
    @InjectRepository(MerchandiseBundleItem)
    private bundleItemRepository: Repository<MerchandiseBundleItem>
  ) {}

  async create(createBundleDto: CreateMerchandiseBundleDto): Promise<MerchandiseBundle> {
    const { items, ...bundleData } = createBundleDto

    // Generate slug if not provided
    if (!bundleData.slug) {
      bundleData.slug = this.generateSlug(bundleData.name)
    }

    // Check if slug already exists
    const existingSlug = await this.bundleRepository.findOne({
      where: { slug: bundleData.slug },
    })

    if (existingSlug) {
      throw new ConflictException("Bundle with this slug already exists")
    }

    // Validate merchandise items exist
    for (const item of items) {
      await this.merchandiseService.findOne(item.merchandiseId)
    }

    // Create bundle
    const bundle = this.bundleRepository.create(bundleData)
    const savedBundle = await this.bundleRepository.save(bundle)

    // Create bundle items
    for (const itemData of items) {
      const bundleItem = this.bundleItemRepository.create({
        ...itemData,
        bundleId: savedBundle.id,
      })
      await this.bundleItemRepository.save(bundleItem)
    }

    return this.findOne(savedBundle.id)
  }

  async findAll(artistId?: string) {
    const queryBuilder = this.bundleRepository
      .createQueryBuilder("bundle")
      .leftJoinAndSelect("bundle.artist", "artist")
      .leftJoinAndSelect("bundle.items", "items")
      .leftJoinAndSelect("items.merchandise", "merchandise")

    if (artistId) {
      queryBuilder.where("bundle.artistId = :artistId", { artistId })
    }

    return queryBuilder.getMany()
  }

  async findOne(id: string): Promise<MerchandiseBundle> {
    const bundle = await this.bundleRepository.findOne({
      where: { id },
      relations: ["artist", "items", "items.merchandise", "items.merchandise.images"],
    })

    if (!bundle) {
      throw new NotFoundException("Bundle not found")
    }

    return bundle
  }

  async update(id: string, updateBundleDto: UpdateMerchandiseDto): Promise<MerchandiseBundle> {
    const bundle = await this.findOne(id)

    // Check slug uniqueness if being updated
    if (updateBundleDto.slug && updateBundleDto.slug !== bundle.slug) {
      const existingSlug = await this.bundleRepository.findOne({
        where: { slug: updateBundleDto.slug },
      })

      if (existingSlug) {
        throw new ConflictException("Bundle with this slug already exists")
      }
    }

    Object.assign(bundle, updateBundleDto)
    return this.bundleRepository.save(bundle)
  }

  async remove(id: string): Promise<void> {
    const bundle = await this.findOne(id)
    await this.bundleRepository.remove(bundle)
  }

  async calculateBundlePrice(id: string): Promise<number> {
    const bundle = await this.findOne(id)

    let totalPrice = 0
    for (const item of bundle.items) {
      const itemPrice = item.individualPrice || item.merchandise.basePrice
      totalPrice += itemPrice * item.quantity
    }

    return totalPrice
  }

  async calculateSavings(
    id: string,
  ): Promise<{ originalPrice: number; bundlePrice: number; savings: number; savingsPercentage: number }> {
    const bundle = await this.findOne(id)
    const originalPrice = await this.calculateBundlePrice(id)
    const bundlePrice = bundle.price
    const savings = originalPrice - bundlePrice
    const savingsPercentage = (savings / originalPrice) * 100

    return {
      originalPrice,
      bundlePrice,
      savings,
      savingsPercentage,
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
}
