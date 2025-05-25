import { type MigrationInterface, type QueryRunner, Table, Index } from "typeorm"

export class CreateI18nTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create translations table
    await queryRunner.createTable(
      new Table({
        name: "translations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "key",
            type: "varchar",
            length: "255",
          },
          {
            name: "language",
            type: "varchar",
            length: "10",
          },
          {
            name: "value",
            type: "text",
          },
          {
            name: "type",
            type: "enum",
            enum: [
              "music_metadata",
              "ui_text",
              "genre",
              "artist_bio",
              "album_description",
              "track_title",
              "playlist_name",
              "event_description",
              "merchandise",
            ],
            default: "'ui_text'",
          },
          {
            name: "namespace",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "json",
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

    // Create unique index for translations
    await queryRunner.createIndex(
      "translations",
      new Index("IDX_translations_key_language_type", ["key", "language", "type"], {
        isUnique: true,
      }),
    )

    // Create localized_content table
    await queryRunner.createTable(
      new Table({
        name: "localized_content",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "entityId",
            type: "uuid",
          },
          {
            name: "entityType",
            type: "enum",
            enum: ["track", "album", "artist", "playlist", "event", "merchandise", "genre"],
          },
          {
            name: "language",
            type: "varchar",
            length: "10",
          },
          {
            name: "title",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "json",
            isNullable: true,
          },
          {
            name: "region",
            type: "varchar",
            length: "10",
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

    // Create unique index for localized_content
    await queryRunner.createIndex(
      "localized_content",
      new Index("IDX_localized_content_entity_language", ["entityId", "entityType", "language"], {
        isUnique: true,
      }),
    )

    // Create regional_licenses table
    await queryRunner.createTable(
      new Table({
        name: "regional_licenses",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "entityId",
            type: "uuid",
          },
          {
            name: "entityType",
            type: "varchar",
            length: "50",
          },
          {
            name: "region",
            type: "varchar",
            length: "10",
          },
          {
            name: "licenseType",
            type: "enum",
            enum: ["streaming", "download", "sync", "performance", "mechanical"],
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "pending", "expired", "restricted"],
            default: "'pending'",
          },
          {
            name: "royaltyRate",
            type: "decimal",
            precision: 10,
            scale: 4,
            isNullable: true,
          },
          {
            name: "currency",
            type: "varchar",
            length: "10",
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
            name: "restrictions",
            type: "json",
            isNullable: true,
          },
          {
            name: "licenseProvider",
            type: "varchar",
            length: "255",
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

    // Create unique index for regional_licenses
    await queryRunner.createIndex(
      "regional_licenses",
      new Index("IDX_regional_licenses_entity_region_type", ["entityId", "entityType", "region", "licenseType"], {
        isUnique: true,
      }),
    )

    // Create culture_preferences table
    await queryRunner.createTable(
      new Table({
        name: "culture_preferences",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "uuid",
          },
          {
            name: "preferredLanguage",
            type: "varchar",
            length: "10",
          },
          {
            name: "region",
            type: "varchar",
            length: "10",
          },
          {
            name: "currency",
            type: "varchar",
            length: "10",
          },
          {
            name: "timezone",
            type: "varchar",
            length: "50",
          },
          {
            name: "genrePreferences",
            type: "json",
            isNullable: true,
          },
          {
            name: "culturalTags",
            type: "json",
            isNullable: true,
          },
          {
            name: "explicitContent",
            type: "boolean",
            default: true,
          },
          {
            name: "dateFormat",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "timeFormat",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "numberFormat",
            type: "varchar",
            length: "10",
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

    // Create unique index for culture_preferences
    await queryRunner.createIndex(
      "culture_preferences",
      new Index("IDX_culture_preferences_userId", ["userId"], {
        isUnique: true,
      }),
    )

    // Create additional indexes for performance
    await queryRunner.createIndex("translations", new Index("IDX_translations_key", ["key"]))

    await queryRunner.createIndex("translations", new Index("IDX_translations_language", ["language"]))

    await queryRunner.createIndex("translations", new Index("IDX_translations_type", ["type"]))

    await queryRunner.createIndex("localized_content", new Index("IDX_localized_content_entityId", ["entityId"]))

    await queryRunner.createIndex("localized_content", new Index("IDX_localized_content_entityType", ["entityType"]))

    await queryRunner.createIndex("localized_content", new Index("IDX_localized_content_language", ["language"]))

    await queryRunner.createIndex("regional_licenses", new Index("IDX_regional_licenses_entityId", ["entityId"]))

    await queryRunner.createIndex("regional_licenses", new Index("IDX_regional_licenses_region", ["region"]))

    await queryRunner.createIndex("regional_licenses", new Index("IDX_regional_licenses_status", ["status"]))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("culture_preferences")
    await queryRunner.dropTable("regional_licenses")
    await queryRunner.dropTable("localized_content")
    await queryRunner.dropTable("translations")
  }
}
