import { type MigrationInterface, type QueryRunner, Table, Index, ForeignKey } from "typeorm"

export class CreateInventoryTables1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create suppliers table
    await queryRunner.createTable(
      new Table({
        name: "suppliers",
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
            length: "255",
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "phone",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "address",
            type: "text",
            isNullable: true,
          },
          {
            name: "contactPerson",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "rating",
            type: "decimal",
            precision: 3,
            scale: 2,
            default: 0,
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    )

    // Create inventory_items table
    await queryRunner.createTable(
      new Table({
        name: "inventory_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "sku",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "category",
            type: "varchar",
            length: "100",
          },
          {
            name: "unitPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "costPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "currentStock",
            type: "int",
            default: 0,
          },
          {
            name: "minimumStock",
            type: "int",
            default: 10,
          },
          {
            name: "maximumStock",
            type: "int",
            default: 100,
          },
          {
            name: "reorderPoint",
            type: "int",
            default: 50,
          },
          {
            name: "reorderQuantity",
            type: "int",
            default: 100,
          },
          {
            name: "unit",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "discontinued", "out_of_stock"],
            default: "'active'",
          },
          {
            name: "supplierId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "json",
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    )

    // Create inventory_batches table
    await queryRunner.createTable(
      new Table({
        name: "inventory_batches",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "batchNumber",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "lotNumber",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "inventoryItemId",
            type: "uuid",
          },
          {
            name: "quantity",
            type: "int",
          },
          {
            name: "reservedQuantity",
            type: "int",
            default: 0,
          },
          {
            name: "soldQuantity",
            type: "int",
            default: 0,
          },
          {
            name: "costPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "manufacturingDate",
            type: "date",
            isNullable: true,
          },
          {
            name: "expiryDate",
            type: "date",
            isNullable: true,
          },
          {
            name: "receivedDate",
            type: "date",
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "expired", "recalled", "sold_out"],
            default: "'active'",
          },
          {
            name: "notes",
            type: "text",
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    )

    // Create inventory_audits table
    await queryRunner.createTable(
      new Table({
        name: "inventory_audits",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "inventoryItemId",
            type: "uuid",
          },
          {
            name: "type",
            type: "enum",
            enum: ["stock_in", "stock_out", "adjustment", "transfer", "damage", "return"],
          },
          {
            name: "quantityBefore",
            type: "int",
          },
          {
            name: "quantityChanged",
            type: "int",
          },
          {
            name: "quantityAfter",
            type: "int",
          },
          {
            name: "reason",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "reference",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "performedBy",
            type: "varchar",
            length: "100",
          },
          {
            name: "metadata",
            type: "json",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    )

    // Create purchase_orders table
    await queryRunner.createTable(
      new Table({
        name: "purchase_orders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "orderNumber",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "supplierId",
            type: "uuid",
          },
          {
            name: "status",
            type: "enum",
            enum: ["draft", "pending", "approved", "ordered", "partially_received", "received", "cancelled"],
            default: "'draft'",
          },
          {
            name: "totalAmount",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "orderDate",
            type: "date",
            isNullable: true,
          },
          {
            name: "expectedDeliveryDate",
            type: "date",
            isNullable: true,
          },
          {
            name: "actualDeliveryDate",
            type: "date",
            isNullable: true,
          },
          {
            name: "createdBy",
            type: "varchar",
            length: "100",
          },
          {
            name: "approvedBy",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "notes",
            type: "text",
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    )

    // Create purchase_order_items table
    await queryRunner.createTable(
      new Table({
        name: "purchase_order_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "purchaseOrderId",
            type: "uuid",
          },
          {
            name: "inventoryItemId",
            type: "uuid",
          },
          {
            name: "quantityOrdered",
            type: "int",
          },
          {
            name: "quantityReceived",
            type: "int",
            default: 0,
          },
          {
            name: "unitPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "totalPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
        ],
      }),
    )

    // Create inventory_forecasts table
    await queryRunner.createTable(
      new Table({
        name: "inventory_forecasts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "inventoryItemId",
            type: "uuid",
          },
          {
            name: "forecastDate",
            type: "date",
          },
          {
            name: "predictedDemand",
            type: "int",
          },
          {
            name: "recommendedStock",
            type: "int",
          },
          {
            name: "confidenceLevel",
            type: "decimal",
            precision: 5,
            scale: 2,
          },
          {
            name: "factors",
            type: "json",
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    )

    // Create foreign keys
    await queryRunner.createForeignKey(
      "inventory_items",
      new ForeignKey({
        columnNames: ["supplierId"],
        referencedTableName: "suppliers",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
    )

    await queryRunner.createForeignKey(
      "inventory_batches",
      new ForeignKey({
        columnNames: ["inventoryItemId"],
        referencedTableName: "inventory_items",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "inventory_audits",
      new ForeignKey({
        columnNames: ["inventoryItemId"],
        referencedTableName: "inventory_items",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "purchase_orders",
      new ForeignKey({
        columnNames: ["supplierId"],
        referencedTableName: "suppliers",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
      }),
    )

    await queryRunner.createForeignKey(
      "purchase_order_items",
      new ForeignKey({
        columnNames: ["purchaseOrderId"],
        referencedTableName: "purchase_orders",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "purchase_order_items",
      new ForeignKey({
        columnNames: ["inventoryItemId"],
        referencedTableName: "inventory_items",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
      }),
    )

    await queryRunner.createForeignKey(
      "inventory_forecasts",
      new ForeignKey({
        columnNames: ["inventoryItemId"],
        referencedTableName: "inventory_items",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    // Create indexes for better performance
    await queryRunner.createIndex("inventory_items", new Index("IDX_inventory_items_category", ["category"]))

    await queryRunner.createIndex("inventory_items", new Index("IDX_inventory_items_status", ["status"]))

    await queryRunner.createIndex(
      "inventory_items",
      new Index("IDX_inventory_items_low_stock", ["currentStock", "reorderPoint"]),
    )

    await queryRunner.createIndex("inventory_batches", new Index("IDX_inventory_batches_expiry", ["expiryDate"]))

    await queryRunner.createIndex("inventory_audits", new Index("IDX_inventory_audits_created_at", ["createdAt"]))

    await queryRunner.createIndex("inventory_audits", new Index("IDX_inventory_audits_type", ["type"]))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order due to foreign key constraints
    await queryRunner.dropTable("inventory_forecasts")
    await queryRunner.dropTable("purchase_order_items")
    await queryRunner.dropTable("purchase_orders")
    await queryRunner.dropTable("inventory_audits")
    await queryRunner.dropTable("inventory_batches")
    await queryRunner.dropTable("inventory_items")
    await queryRunner.dropTable("suppliers")
  }
}
