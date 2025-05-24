import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { TreeRepository } from "typeorm"
import type { CreateMerchandiseCategoryDto } from "../dto/create-merchandise-category.dto"
import { MerchandiseCategory } from "../entities/merchandise-category.entity"
import { UpdateMerchandiseDto } from "../dto/update-merchandise.dto"

@Injectable()
export class MerchandiseCategoryService {
  constructor(
    @InjectRepository(MerchandiseCategory)
    private categoryRepository: TreeRepository<MerchandiseCategory>
  ) {}

  async create(createCategoryDto: CreateMerchandiseCategoryDto): Promise<MerchandiseCategory> {
    const { parentId, ...categoryData } = createCategoryDto

    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = this.generateSlug(categoryData.name)
    }

    // Check if slug already exists
    const existingSlug = await this.categoryRepository.findOne({
      where: { slug: categoryData.slug },
    })

    if (existingSlug) {
      throw new ConflictException("Category with this slug already exists")
    }

    const category = this.categoryRepository.create(categoryData)

    // Set parent if provided
    if (parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      })

      if (!parent) {
        throw new NotFoundException("Parent category not found")
      }

      category.parent = parent
    }

    return this.categoryRepository.save(category)
  }

  async findAll(): Promise<MerchandiseCategory[]> {
    return this.categoryRepository.findTrees()
  }

  async findRoots(): Promise<MerchandiseCategory[]> {
    return this.categoryRepository.findRoots()
  }

  async findOne(id: string): Promise<MerchandiseCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["merchandise"],
    })

    if (!category) {
      throw new NotFoundException("Category not found")
    }

    return category
  }

  async findDescendants(id: string): Promise<MerchandiseCategory[]> {
    const category = await this.findOne(id)
    return this.categoryRepository.findDescendants(category)
  }

  async update(id: string, updateCategoryDto: UpdateMerchandiseDto): Promise<MerchandiseCategory> {
    const category = await this.findOne(id)

    // Check slug uniqueness if being updated
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      })

      if (existingSlug) {
        throw new ConflictException("Category with this slug already exists")
      }
    }

    Object.assign(category, updateCategoryDto)
    return this.categoryRepository.save(category)
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)

    // Check if category has merchandise
    if (category.merchandise && category.merchandise.length > 0) {
      throw new ConflictException("Cannot delete category with associated merchandise")
    }

    await this.categoryRepository.remove(category)
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
}
