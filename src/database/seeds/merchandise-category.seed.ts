import { MerchandiseCategory } from "src/modules/merchandise/entities/merchandise-category.entity"
import { MerchandiseType } from "src/modules/merchandise/enums/merchandise.enums"
import type { DataSource } from "typeorm"

export class MerchandiseCategorySeed {
  public static async run(dataSource: DataSource): Promise<void> {
    const categoryRepository = dataSource.getRepository(MerchandiseCategory)

    const categories = [
      {
        name: "Apparel",
        slug: "apparel",
        description: "Clothing and wearable items",
        type: MerchandiseType.APPAREL,
        sortOrder: 1,
        children: [
          {
            name: "T-Shirts",
            slug: "apparel-t-shirts",
            description: "Artist t-shirts and band tees",
            type: MerchandiseType.APPAREL,
            sortOrder: 1,
          },
          {
            name: "Hoodies & Sweatshirts",
            slug: "apparel-hoodies",
            description: "Hoodies, sweatshirts, and zip-ups",
            type: MerchandiseType.APPAREL,
            sortOrder: 2,
          },
          {
            name: "Hats & Caps",
            slug: "apparel-hats",
            description: "Hats, caps, and headwear",
            type: MerchandiseType.APPAREL,
            sortOrder: 3,
          },
        ],
      },
      {
        name: "Music",
        slug: "music",
        description: "Physical music releases",
        type: MerchandiseType.VINYL,
        sortOrder: 2,
        children: [
          {
            name: "Vinyl Records",
            slug: "music-vinyl",
            description: "LP and EP vinyl records",
            type: MerchandiseType.VINYL,
            sortOrder: 1,
          },
          {
            name: "CDs",
            slug: "music-cds",
            description: "Compact disc releases",
            type: MerchandiseType.CD,
            sortOrder: 2,
          },
        ],
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Bags, pins, and other accessories",
        type: MerchandiseType.ACCESSORIES,
        sortOrder: 3,
        children: [
          {
            name: "Pins & Badges",
            slug: "accessories-pins",
            description: "Enamel pins and badges",
            type: MerchandiseType.ACCESSORIES,
            sortOrder: 1,
          },
          {
            name: "Bags & Totes",
            slug: "accessories-bags",
            description: "Tote bags and backpacks",
            type: MerchandiseType.ACCESSORIES,
            sortOrder: 2,
          },
        ],
      },
      {
        name: "Collectibles",
        slug: "collectibles",
        description: "Limited edition and collectible items",
        type: MerchandiseType.COLLECTIBLE,
        sortOrder: 4,
        children: [
          {
            name: "Posters",
            slug: "collectibles-posters",
            description: "Art prints and posters",
            type: MerchandiseType.POSTER,
            sortOrder: 1,
          },
          {
            name: "Limited Edition",
            slug: "collectibles-limited",
            description: "Limited edition collectibles",
            type: MerchandiseType.COLLECTIBLE,
            sortOrder: 2,
          },
        ],
      },
    ]

    for (const categoryData of categories) {
      const { children, ...parentData } = categoryData

      // Create parent category
      const parentCategory = categoryRepository.create(parentData)
      const savedParent = await categoryRepository.save(parentCategory)

      // Create child categories
      if (children) {
        for (const childData of children) {
          const childCategory = categoryRepository.create({
            ...childData,
            parent: savedParent,
          })
          await categoryRepository.save(childCategory)
        }
      }
    }

    console.log("Merchandise categories seeded successfully")
  }
}
