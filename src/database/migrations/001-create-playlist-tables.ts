import { type MigrationInterface, type QueryRunner, Table, Index, ForeignKey } from "typeorm"

export class CreatePlaylistTables1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create playlists table
    await queryRunner.createTable(
      new Table({
        name: "playlists",
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
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "cover_image",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "privacy",
            type: "enum",
            enum: ["public", "private", "unlisted"],
            default: "'public'",
          },
          {
            name: "type",
            type: "enum",
            enum: ["manual", "smart"],
            default: "'manual'",
          },
          {
            name: "smart_criteria",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "is_collaborative",
            type: "boolean",
            default: false,
          },
          {
            name: "track_count",
            type: "int",
            default: 0,
          },
          {
            name: "total_duration",
            type: "int",
            default: 0,
          },
          {
            name: "followers_count",
            type: "int",
            default: 0,
          },
          {
            name: "plays_count",
            type: "int",
            default: 0,
          },
          {
            name: "share_token",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "created_by",
            type: "uuid",
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
          },
        ],
      }),
      true,
    )

    // Create playlist_tracks table
    await queryRunner.createTable(
      new Table({
        name: "playlist_tracks",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "playlist_id",
            type: "uuid",
          },
          {
            name: "track_id",
            type: "uuid",
          },
          {
            name: "position",
            type: "int",
          },
          {
            name: "added_by",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "added_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create playlist_collaborators table
    await queryRunner.createTable(
      new Table({
        name: "playlist_collaborators",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "playlist_id",
            type: "uuid",
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "role",
            type: "enum",
            enum: ["editor", "viewer"],
            default: "'editor'",
          },
          {
            name: "invited_by",
            type: "uuid",
          },
          {
            name: "invited_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create playlist_follows table
    await queryRunner.createTable(
      new Table({
        name: "playlist_follows",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "playlist_id",
            type: "uuid",
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "followed_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    )

    // Create indexes
    await queryRunner.createIndex("playlists", new Index("IDX_PLAYLIST_CREATED_BY_PRIVACY", ["created_by", "privacy"]))

    await queryRunner.createIndex("playlists", new Index("IDX_PLAYLIST_PRIVACY_CREATED_AT", ["privacy", "created_at"]))

    await queryRunner.createIndex(
      "playlist_tracks",
      new Index("IDX_PLAYLIST_TRACKS_PLAYLIST_POSITION", ["playlist_id", "position"]),
    )

    await queryRunner.createIndex(
      "playlist_tracks",
      new Index("IDX_PLAYLIST_TRACKS_UNIQUE", ["playlist_id", "track_id"], { isUnique: true }),
    )

    await queryRunner.createIndex(
      "playlist_collaborators",
      new Index("IDX_PLAYLIST_COLLABORATORS_UNIQUE", ["playlist_id", "user_id"], { isUnique: true }),
    )

    await queryRunner.createIndex(
      "playlist_follows",
      new Index("IDX_PLAYLIST_FOLLOWS_UNIQUE", ["playlist_id", "user_id"], { isUnique: true }),
    )

    // Create foreign keys
    await queryRunner.createForeignKey(
      "playlists",
      new ForeignKey({
        columnNames: ["created_by"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_tracks",
      new ForeignKey({
        columnNames: ["playlist_id"],
        referencedTableName: "playlists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_tracks",
      new ForeignKey({
        columnNames: ["track_id"],
        referencedTableName: "tracks",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_tracks",
      new ForeignKey({
        columnNames: ["added_by"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_collaborators",
      new ForeignKey({
        columnNames: ["playlist_id"],
        referencedTableName: "playlists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_collaborators",
      new ForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_collaborators",
      new ForeignKey({
        columnNames: ["invited_by"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_follows",
      new ForeignKey({
        columnNames: ["playlist_id"],
        referencedTableName: "playlists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "playlist_follows",
      new ForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("playlist_follows")
    await queryRunner.dropTable("playlist_collaborators")
    await queryRunner.dropTable("playlist_tracks")
    await queryRunner.dropTable("playlists")
  }
}
