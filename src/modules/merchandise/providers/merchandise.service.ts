import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { Repository } from "typeorm"
import { CreateMerchandiseDto } from "../dto/create-merchandise.dto"
import { UpdateMerchandiseDto } from "../dto/update-merchandise.dto"
import { QueryMerchandiseDto } from "../dto/query-merchandise.dto"
import { Merchandise } from "../entities/merchandise.entity"
import { MerchandiseVariant } from "../entities/merchandise-variant.entity"
import { MerchandiseInventory } from "../entities/merchandise-inventory.entity"
import { MerchandiseImage } from "../entities/merchandise-image.entity"
import { InventoryStatus } from "../enums/inventoryStatus.enum"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class MerchandiseService {
   constructor(
    @InjectRepository(Merchandise)
    private readonly merchandiseRepository: Repository<Merchandise>,

    @InjectRepository(MerchandiseVariant)
    private readonly variantRepository: Repository<MerchandiseVariant>,

    @InjectRepository(MerchandiseInventory)
    private readonly inventoryRepository: Repository<MerchandiseInventory>,

    @InjectRepository(MerchandiseImage)
    private readonly imageRepository: Repository<MerchandiseImage>,
  ) {}

  async create(createMerchandiseDto: CreateMerchandiseDto): Promise<Merchandise> {
    const { variants, images, ...merchandiseData } = createMerchandiseDto

    // Generate slug if not provided
    if (!merchandiseData.slug) {
      merchandiseData.slug = this.generateSlug(merchandiseData.name)
    }

    // Check if slug already exists
    const existingSlug = await this.merchandiseRepository.findOne({
      where: { slug: merchandiseData.slug },
    })

    if (existingSlug) {
      throw new ConflictException("Merchandise with this slug already exists")
    }

    // Create merchandise
    const merchandise = this.merchandiseRepository.create(merchandiseData)
    const savedMerchandise = await this.merchandiseRepository.save(merchandise)

    // Create variants if provided
    if (variants && variants.length > 0) {
      for (const variantData of variants) {
        const { initialQuantity, lowStockThreshold, ...variantInfo } = variantData

        const variant = this.variantRepository.create({
          ...variantInfo,
          merchandiseId: savedMerchandise.id,
          type: variantInfo.type as any, // Cast to the correct enum/type if needed
        })
        const savedVariant = await this.variantRepository.save(variant)

        // Create initial inventory
        if (initialQuantity !== undefined) {
          const inventory = this.inventoryRepository.create({
            variantId: savedVariant.id,
            quantity: initialQuantity,
            lowStockThreshold: lowStockThreshold || 0,
            status: initialQuantity > 0 ? InventoryStatus.IN_STOCK : InventoryStatus.OUT_OF_STOCK,
          })
          await this.inventoryRepository.save(inventory)
        }
      }
    }

    // Create images if provided
    if (images && images.length > 0) {
      for (const imageData of images) {
        const image = this.imageRepository.create({
          ...imageData,
          merchandiseId: savedMerchandise.id,
        })
        await this.imageRepository.save(image)
      }
    }

    return this.findOne(savedMerchandise.id)
  }

  async findAll(queryDto: QueryMerchandiseDto) {
    const {
      search,
      artistId,
      categoryId,
      type,
      status,
      isLimitedEdition,
      isPreOrder,
      minPrice,
      maxPrice,
      tags,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = queryDto

    const queryBuilder = this.merchandiseRepository
      .createQueryBuilder("merchandise")
      .leftJoinAndSelect("merchandise.artist", "artist")
      .leftJoinAndSelect("merchandise.category", "category")
      .leftJoinAndSelect("merchandise.variants", "variants")
      .leftJoinAndSelect("variants.inventory", "inventory")
      .leftJoinAndSelect("merchandise.images", "images")

    // Apply filters
    if (search) {
      queryBuilder.andWhere("(merchandise.name ILIKE :search OR merchandise.description ILIKE :search)", {
        search: `%${search}%`,
      })
    }

    if (artistId) {
      queryBuilder.andWhere("merchandise.artistId = :artistId", { artistId })
    }

    if (categoryId) {
      queryBuilder.andWhere("merchandise.categoryId = :categoryId", { categoryId })
    }

    if (type) {
      queryBuilder.andWhere("category.type = :type", { type })
    }

    if (status) {
      queryBuilder.andWhere("merchandise.status = :status", { status })
    }

    if (isLimitedEdition !== undefined) {
      queryBuilder.andWhere("merchandise.isLimitedEdition = :isLimitedEdition", { isLimitedEdition })
    }

    if (isPreOrder !== undefined) {
      queryBuilder.andWhere("merchandise.isPreOrder = :isPreOrder", { isPreOrder })
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        queryBuilder.andWhere("merchandise.basePrice BETWEEN :minPrice AND :maxPrice", {
          minPrice,
          maxPrice,
        })
      } else if (minPrice !== undefined) {
        queryBuilder.andWhere("merchandise.basePrice >= :minPrice", { minPrice })
      } else if (maxPrice !== undefined) {
        queryBuilder.andWhere("merchandise.basePrice <= :maxPrice", { maxPrice })
      }
    }

    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim())
      queryBuilder.andWhere("merchandise.tags ?| array[:...tags]", { tags: tagArray })
    }

    // Sorting
    queryBuilder.orderBy(`merchandise.${sortBy}`, sortOrder)

    // Pagination
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    const [items, total] = await queryBuilder.getManyAndCount()

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Merchandise> {
    const merchandise = await this.merchandiseRepository.findOne({
      where: { id },
      relations: [
        "artist",
        "category",
        "variants",
        "variants.inventory",
        "images",
        "bundleItems",
        "bundleItems.bundle",
      ],
    })

    if (!merchandise) {
      throw new NotFoundException("Merchandise not found")
    }

    return merchandise
  }

  async findBySlug(slug: string): Promise<Merchandise> {
    const merchandise = await this.merchandiseRepository.findOne({
      where: { slug },
      relations: [
        "artist",
        "category",
        "variants",
        "variants.inventory",
        "images",
        "bundleItems",
        "bundleItems.bundle",
      ],
    })

    if (!merchandise) {
      throw new NotFoundException("Merchandise not found")
    }

    return merchandise
  }

  async update(id: string, updateMerchandiseDto: UpdateMerchandiseDto): Promise<Merchandise> {
    const merchandise = await this.findOne(id)

    // Check slug uniqueness if being updated
    if (updateMerchandiseDto.slug && updateMerchandiseDto.slug !== merchandise.slug) {
      const existingSlug = await this.merchandiseRepository.findOne({
        where: { slug: updateMerchandiseDto.slug },
      })

      if (existingSlug) {
        throw new ConflictException("Merchandise with this slug already exists")
      }
    }

    Object.assign(merchandise, updateMerchandiseDto)
    return this.merchandiseRepository.save(merchandise)
  }

  async remove(id: string): Promise<void> {
    const merchandise = await this.findOne(id)
    await this.merchandiseRepository.remove(merchandise)
  }

  async updateInventory(variantId: string, quantity: number): Promise<MerchandiseInventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
      relations: ["variant"],
    })

    if (!inventory) {
      throw new NotFoundException("Inventory record not found")
    }

    inventory.quantity = quantity
    inventory.lastRestockedAt = new Date()

    // Update status based on quantity
    if (quantity === 0) {
      inventory.status = InventoryStatus.OUT_OF_STOCK
    } else if (quantity <= inventory.lowStockThreshold) {
      inventory.status = InventoryStatus.LOW_STOCK
    } else {
      inventory.status = InventoryStatus.IN_STOCK
    }

    return this.inventoryRepository.save(inventory)
  }

  async reserveInventory(variantId: string, quantity: number): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
    })

    if (!inventory) {
      throw new NotFoundException("Inventory record not found")
    }

    if (inventory.availableQuantity < quantity) {
      return false
    }

    inventory.reserved += quantity
    await this.inventoryRepository.save(inventory)
    return true
  }

  async releaseInventory(variantId: string, quantity: number): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
    })

    if (!inventory) {
      throw new NotFoundException("Inventory record not found")
    }

    inventory.reserved = Math.max(0, inventory.reserved - quantity)
    await this.inventoryRepository.save(inventory)
  }

  async getInventoryReport(artistId?: string) {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder("inventory")
      .leftJoinAndSelect("inventory.variant", "variant")
      .leftJoinAndSelect("variant.merchandise", "merchandise")
      .leftJoinAndSelect("merchandise.artist", "artist")

    if (artistId) {
      queryBuilder.where("merchandise.artistId = :artistId", { artistId })
    }

    const inventoryRecords = await queryBuilder.getMany()

    return {
      totalItems: inventoryRecords.length,
      totalQuantity: inventoryRecords.reduce((sum, inv) => sum + inv.quantity, 0),
      totalReserved: inventoryRecords.reduce((sum, inv) => sum + inv.reserved, 0),
      lowStockItems: inventoryRecords.filter((inv) => inv.status === InventoryStatus.LOW_STOCK),
      outOfStockItems: inventoryRecords.filter((inv) => inv.status === InventoryStatus.OUT_OF_STOCK),
      items: inventoryRecords,
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
}
