import { type MigrationInterface, type QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm"

export class CreateMerchandiseTables1703000000001 implements MigrationInterface {
  name = "CreateMerchandiseTables1703000000001"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create merchandise_categories table
    await queryRunner.createTable(
      new Table({
        name: "merchandise_categories",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
          },
          {
            name: "slug",
            type: "varchar",
            length: "200",
            isUnique: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "type",
            type: "enum",
            enum: ["apparel", "accessories", "vinyl", "cd", "poster", "collectible", "digital", "other"],
            default: "'other'",
          },
          {
            name: "image",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "sortOrder",
            type: "integer",
            default: 0,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create merchandise table
    await queryRunner.createTable(
      new Table({
        name: "merchandise",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "200",
          },
          {
            name: "slug",
            type: "varchar",
            length: "300",
            isUnique: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "shortDescription",
            type: "text",
            isNullable: true,
          },
          {
            name: "artistId",
            type: "uuid",
          },
          {
            name: "categoryId",
            type: "uuid",
          },
          {
            name: "sku",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "basePrice",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "compareAtPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["draft", "active", "inactive", "discontinued"],
            default: "'draft'",
          },
          {
            name: "isLimitedEdition",
            type: "boolean",
            default: false,
          },
          {
            name: "limitedEditionQuantity",
            type: "integer",
            isNullable: true,
          },
          {
            name: "isPreOrder",
            type: "boolean",
            default: false,
          },
          {
            name: "preOrderReleaseDate",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "requiresShipping",
            type: "boolean",
            default: false,
          },
          {
            name: "weight",
            type: "decimal",
            precision: 8,
            scale: 3,
            isNullable: true,
          },
          {
            name: "dimensions",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "tags",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "sortOrder",
            type: "integer",
            default: 0,
          },
          {
            name: "publishedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create merchandise_variants table
    await queryRunner.createTable(
      new Table({
        name: "merchandise_variants",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "merchandiseId",
            type: "uuid",
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
          },
          {
            name: "sku",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "type",
            type: "enum",
            enum: ["size", "color", "design", "material", "edition"],
          },
          {
            name: "value",
            type: "varchar",
            length: "100",
          },
          {
            name: "priceModifier",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "image",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "weight",
            type: "decimal",
            precision: 8,
            scale: 3,
            isNullable: true,
          },
          {
            name: "attributes",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "sortOrder",
            type: "integer",
            default: 0,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create merchandise_inventory table
    await queryRunner.createTable(
      new Table({
        name: "merchandise_inventory",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "variantId",
            type: "uuid",
          },
          {
            name: "quantity",
            type: "integer",
            default: 0,
          },
          {
            name: "reserved",
            type: "integer",
            default: 0,
          },
          {
            name: "lowStockThreshold",
            type: "integer",
            default: 0,
          },
          {
            name: "status",
            type: "enum",
            enum: ["in_stock", "low_stock", "out_of_stock", "pre_order", "discontinued"],
            default: "'in_stock'",
          },
          {
            name: "location",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "lastRestockedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "expectedRestockDate",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "notes",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create merchandise_images table
    await queryRunner.createTable(
      new Table({
        name: "merchandise_images",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "merchandiseId",
            type: "uuid",
          },
          {
            name: "url",
            type: "varchar",
          },
          {
            name: "thumbnailUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "altText",
            type: "varchar",
            length: "200",
            isNullable: true,
          },
          {
            name: "isPrimary",
            type: "boolean",
            default: false,
          },
          {
            name: "sortOrder",
            type: "integer",
            default: 0,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create merchandise_bundles table
    await queryRunner.createTable(
      new Table({
        name: "merchandise_bundles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "200",
          },
          {
            name: "slug",
            type: "varchar",
            length: "300",
            isUnique: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "artistId",
            type: "uuid",
          },
          {
            name: "type",
            type: "enum",
            enum: ["fixed", "flexible", "tiered"],
            default: "'fixed'",
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "compareAtPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "discountPercentage",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["draft", "active", "inactive", "discontinued"],
            default: "'draft'",
          },
          {
            name: "isLimitedEdition",
            type: "boolean",
            default: false,
          },
          {
            name: "limitedQuantity",
            type: "integer",
            isNullable: true,
          },
          {
            name: "validFrom",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "validUntil",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "image",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "tags",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create merchandise_bundle_items table
    await queryRunner.createTable(
      new Table({
        name: "merchandise_bundle_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "bundleId",
            type: "uuid",
          },
          {
            name: "merchandiseId",
            type: "uuid",
          },
          {
            name: "quantity",
            type: "integer",
            default: 1,
          },
          {
            name: "isOptional",
            type: "boolean",
            default: false,
          },
          {
            name: "individualPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "sortOrder",
            type: "integer",
            default: 0,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create closure table for categories hierarchy
    await queryRunner.createTable(
      new Table({
        name: "merchandise_categories_closure",
        columns: [
          {
            name: "id_ancestor",
            type: "uuid",
          },
          {
            name: "id_descendant",
            type: "uuid",
          },
        ],
      }),
      true,
    )

    // Create indexes
    await queryRunner.createIndex("merchandise", new TableIndex({ name: "IDX_MERCHANDISE_ARTIST_STATUS", columnNames: ["artistId", "status"] }))
    await queryRunner.createIndex("merchandise", new TableIndex({ name: "IDX_MERCHANDISE_CATEGORY_STATUS", columnNames: ["categoryId", "status"] }))
    await queryRunner.createIndex(
      "merchandise_variants",
      new TableIndex({ name: "IDX_VARIANT_MERCHANDISE_ACTIVE", columnNames: ["merchandiseId", "isActive"] }),
    )
    await queryRunner.createIndex("merchandise_inventory", new TableIndex({ name: "IDX_INVENTORY_VARIANT", columnNames: ["variantId"] }))
    await queryRunner.createIndex("merchandise_inventory", new TableIndex({ name: "IDX_INVENTORY_STATUS", columnNames: ["status"] }))
    await queryRunner.createIndex(
      "merchandise_images",
      new TableIndex({ name: "IDX_IMAGE_MERCHANDISE_SORT", columnNames: ["merchandiseId", "sortOrder"] }),
    )
    await queryRunner.createIndex("merchandise_bundles", new TableIndex({ name: "IDX_BUNDLE_ARTIST_STATUS", columnNames: ["artistId", "status"] }))
    await queryRunner.createIndex(
      "merchandise_bundle_items",
      new TableIndex({ name: "IDX_BUNDLE_ITEM_BUNDLE_MERCHANDISE", columnNames: ["bundleId", "merchandiseId"] }),
    )

    // Create foreign keys
    await queryRunner.createForeignKey(
      "merchandise",
      new TableForeignKey({
        columnNames: ["artistId"],
        referencedTableName: "artists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise",
      new TableForeignKey({
        columnNames: ["categoryId"],
        referencedTableName: "merchandise_categories",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_variants",
      new TableForeignKey({
        columnNames: ["merchandiseId"],
        referencedTableName: "merchandise",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_inventory",
      new TableForeignKey({
        columnNames: ["variantId"],
        referencedTableName: "merchandise_variants",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_images",
      new TableForeignKey({
        columnNames: ["merchandiseId"],
        referencedTableName: "merchandise",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_bundles",
      new TableForeignKey({
        columnNames: ["artistId"],
        referencedTableName: "artists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_bundle_items",
      new TableForeignKey({
        columnNames: ["bundleId"],
        referencedTableName: "merchandise_bundles",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_bundle_items",
      new TableForeignKey({
        columnNames: ["merchandiseId"],
        referencedTableName: "merchandise",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_categories_closure",
      new TableForeignKey({
        columnNames: ["id_ancestor"],
        referencedTableName: "merchandise_categories",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "merchandise_categories_closure",
      new TableForeignKey({
        columnNames: ["id_descendant"],
        referencedTableName: "merchandise_categories",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("merchandise_bundle_items")
    await queryRunner.dropTable("merchandise_bundles")
    await queryRunner.dropTable("merchandise_images")
    await queryRunner.dropTable("merchandise_inventory")
    await queryRunner.dropTable("merchandise_variants")
    await queryRunner.dropTable("merchandise")
    await queryRunner.dropTable("merchandise_categories_closure")
    await queryRunner.dropTable("merchandise_categories")
  }
}
