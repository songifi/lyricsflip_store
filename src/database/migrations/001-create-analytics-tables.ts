import { type MigrationInterface, type QueryRunner, Table, Index } from "typeorm"

export class CreateAnalyticsTables1703001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Artist Analytics Table
    await queryRunner.createTable(
      new Table({
        name: "artist_analytics",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "artistId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "date",
            type: "date",
            isNullable: false,
          },
          {
            name: "totalStreams",
            type: "bigint",
            default: 0,
          },
          {
            name: "uniqueListeners",
            type: "bigint",
            default: 0,
          },
          {
            name: "streamingRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "skipRate",
            type: "int",
            default: 0,
          },
          {
            name: "completionRate",
            type: "int",
            default: 0,
          },
          {
            name: "likes",
            type: "int",
            default: 0,
          },
          {
            name: "shares",
            type: "int",
            default: 0,
          },
          {
            name: "comments",
            type: "int",
            default: 0,
          },
          {
            name: "playlistAdds",
            type: "int",
            default: 0,
          },
          {
            name: "followers",
            type: "int",
            default: 0,
          },
          {
            name: "newFollowers",
            type: "int",
            default: 0,
          },
          {
            name: "merchandiseRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "eventRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "totalRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "geographicData",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "demographicData",
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
        foreignKeys: [
          {
            columnNames: ["artistId"],
            referencedTableName: "artists",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
    )

    // Track Analytics Table
    await queryRunner.createTable(
      new Table({
        name: "track_analytics",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "trackId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "artistId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "date",
            type: "date",
            isNullable: false,
          },
          {
            name: "streams",
            type: "bigint",
            default: 0,
          },
          {
            name: "uniqueListeners",
            type: "bigint",
            default: 0,
          },
          {
            name: "revenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "skipRate",
            type: "int",
            default: 0,
          },
          {
            name: "completionRate",
            type: "int",
            default: 0,
          },
          {
            name: "averageListenDuration",
            type: "int",
            default: 0,
          },
          {
            name: "hourlyStreams",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "platformData",
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
        foreignKeys: [
          {
            columnNames: ["trackId"],
            referencedTableName: "tracks",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["artistId"],
            referencedTableName: "artists",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
    )

    // Revenue Analytics Table
    await queryRunner.createTable(
      new Table({
        name: "revenue_analytics",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "artistId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "date",
            type: "date",
            isNullable: false,
          },
          {
            name: "streamingRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "merchandiseRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "eventRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "licensingRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "totalRevenue",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "projectedRevenue30Days",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "projectedRevenue90Days",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "projectedRevenueYear",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "growthRate",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: "monthOverMonthGrowth",
            type: "decimal",
            precision: 5,
            scale: 2,
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
        foreignKeys: [
          {
            columnNames: ["artistId"],
            referencedTableName: "artists",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
    )

    // Create indexes for better query performance
    await queryRunner.createIndex(
      "artist_analytics",
      new Index("IDX_artist_analytics_artist_date", ["artistId", "date"]),
    )

    await queryRunner.createIndex("artist_analytics", new Index("IDX_artist_analytics_date", ["date"]))

    await queryRunner.createIndex("track_analytics", new Index("IDX_track_analytics_track_date", ["trackId", "date"]))

    await queryRunner.createIndex("track_analytics", new Index("IDX_track_analytics_artist_date", ["artistId", "date"]))

    await queryRunner.createIndex(
      "revenue_analytics",
      new Index("IDX_revenue_analytics_artist_date", ["artistId", "date"]),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("revenue_analytics")
    await queryRunner.dropTable("track_analytics")
    await queryRunner.dropTable("artist_analytics")
  }
}
