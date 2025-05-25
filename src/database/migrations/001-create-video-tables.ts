import { type MigrationInterface, type QueryRunner, Table, Index, ForeignKey } from "typeorm"

export class CreateVideoTables1700000000001 implements MigrationInterface {
  name = "CreateVideoTables1700000000001"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create videos table
    await queryRunner.createTable(
      new Table({
        name: "videos",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "type",
            type: "enum",
            enum: ["music_video", "lyric_video", "behind_scenes", "live_performance", "interview", "documentary"],
            default: "'music_video'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["uploading", "processing", "ready", "failed", "archived"],
            default: "'uploading'",
          },
          {
            name: "original_file_path",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "thumbnail_url",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "poster_url",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "duration",
            type: "int",
            isNullable: true,
          },
          {
            name: "file_size",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "resolution",
            type: "varchar",
            length: "10",
            isNullable: true,
          },
          {
            name: "frame_rate",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: "bit_rate",
            type: "int",
            isNullable: true,
          },
          {
            name: "codec",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "seo_title",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "seo_description",
            type: "text",
            isNullable: true,
          },
          {
            name: "seo_keywords",
            type: "text",
            isNullable: true,
          },
          {
            name: "tags",
            type: "text",
            isNullable: true,
          },
          {
            name: "view_count",
            type: "int",
            default: 0,
          },
          {
            name: "like_count",
            type: "int",
            default: 0,
          },
          {
            name: "share_count",
            type: "int",
            default: 0,
          },
          {
            name: "comment_count",
            type: "int",
            default: 0,
          },
          {
            name: "is_public",
            type: "boolean",
            default: true,
          },
          {
            name: "is_featured",
            type: "boolean",
            default: false,
          },
          {
            name: "is_premium",
            type: "boolean",
            default: false,
          },
          {
            name: "track_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "artist_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "uploaded_by_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
          {
            name: "published_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true,
    )

    // Create video_qualities table
    await queryRunner.createTable(
      new Table({
        name: "video_qualities",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "quality",
            type: "enum",
            enum: ["360p", "480p", "720p", "1080p", "1440p", "2160p"],
          },
          {
            name: "file_path",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "file_url",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "file_size",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "bit_rate",
            type: "int",
            isNullable: false,
          },
          {
            name: "resolution",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "is_ready",
            type: "boolean",
            default: false,
          },
          {
            name: "video_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create video_views table
    await queryRunner.createTable(
      new Table({
        name: "video_views",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "video_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "ip_address",
            type: "varchar",
            length: "45",
            isNullable: false,
          },
          {
            name: "user_agent",
            type: "text",
            isNullable: true,
          },
          {
            name: "watch_duration",
            type: "int",
            default: 0,
          },
          {
            name: "completion_percentage",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: "country",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "city",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "device",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "browser",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create indexes
    await queryRunner.createIndex("videos", new Index("IDX_videos_status_created_at", ["status", "created_at"]))

    await queryRunner.createIndex("videos", new Index("IDX_videos_artist_status", ["artist_id", "status"]))

    await queryRunner.createIndex("videos", new Index("IDX_videos_track_id", ["track_id"]))

    await queryRunner.createIndex(
      "video_qualities",
      new Index("IDX_video_qualities_video_quality", ["video_id", "quality"]),
    )

    await queryRunner.createIndex("video_views", new Index("IDX_video_views_video_created", ["video_id", "created_at"]))

    await queryRunner.createIndex(
      "video_views",
      new Index("IDX_video_views_user_video", ["user_id", "video_id"], { isUnique: true }),
    )

    await queryRunner.createIndex("video_views", new Index("IDX_video_views_ip_video", ["ip_address", "video_id"]))

    // Create foreign keys
    await queryRunner.createForeignKey(
      "videos",
      new ForeignKey({
        columnNames: ["track_id"],
        referencedTableName: "tracks",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
    )

    await queryRunner.createForeignKey(
      "videos",
      new ForeignKey({
        columnNames: ["artist_id"],
        referencedTableName: "artists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "videos",
      new ForeignKey({
        columnNames: ["uploaded_by_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "video_qualities",
      new ForeignKey({
        columnNames: ["video_id"],
        referencedTableName: "videos",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "video_views",
      new ForeignKey({
        columnNames: ["video_id"],
        referencedTableName: "videos",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "video_views",
      new ForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const videosTable = await queryRunner.getTable("videos")
    const videoQualitiesTable = await queryRunner.getTable("video_qualities")
    const videoViewsTable = await queryRunner.getTable("video_views")

    if (videosTable) {
      const videosForeignKeys = videosTable.foreignKeys
      for (const foreignKey of videosForeignKeys) {
        await queryRunner.dropForeignKey("videos", foreignKey)
      }
    }

    if (videoQualitiesTable) {
      const qualitiesForeignKeys = videoQualitiesTable.foreignKeys
      for (const foreignKey of qualitiesForeignKeys) {
        await queryRunner.dropForeignKey("video_qualities", foreignKey)
      }
    }

    if (videoViewsTable) {
      const viewsForeignKeys = videoViewsTable.foreignKeys
      for (const foreignKey of viewsForeignKeys) {
        await queryRunner.dropForeignKey("video_views", foreignKey)
      }
    }

    // Drop tables
    await queryRunner.dropTable("video_views")
    await queryRunner.dropTable("video_qualities")
    await queryRunner.dropTable("videos")
  }
}
