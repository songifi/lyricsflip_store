import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlbums1640000000000 implements MigrationInterface {
  name = 'CreateAlbums1640000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create album_type enum
    await queryRunner.query(`
      CREATE TYPE "album_type_enum" AS ENUM(
        'LP', 'EP', 'Single', 'Compilation', 'Live', 'Remix', 'Soundtrack'
      )
    `);

    // Create album_status enum
    await queryRunner.query(`
      CREATE TYPE "album_status_enum" AS ENUM(
        'draft', 'scheduled', 'released', 'archived'
      )
    `);

    // Create album_genre enum
    await queryRunner.query(`
      CREATE TYPE "album_genre_enum" AS ENUM(
        'rock', 'pop', 'jazz', 'classical', 'electronic', 'hip_hop',
        'country', 'blues', 'folk', 'reggae', 'metal', 'punk',
        'alternative', 'indie', 'r_and_b', 'soul', 'funk', 'disco',
        'world', 'other'
      )
    `);

    // Create albums table
    await queryRunner.query(`
      CREATE TABLE "albums" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text,
        "album_type" "album_type_enum" NOT NULL DEFAULT 'LP',
        "status" "album_status_enum" NOT NULL DEFAULT 'draft',
        "genres" "album_genre_enum"[] DEFAULT '{}',
        "release_date" date,
        "original_release_date" date,
        "record_label" character varying(255),
        "catalog_number" character varying(255),
        "barcode" character varying(255),
        "liner_notes" text,
        "production_info" json,
        "copyright_info" json,
        "total_tracks" integer NOT NULL DEFAULT 0,
        "total_duration" integer NOT NULL DEFAULT 0,
        "price" numeric(10,2),
        "streaming_urls" json,
        "purchase_urls" json,
        "meta_description" text,
        "keywords" text[],
        "social_media" json,
        "is_explicit" boolean NOT NULL DEFAULT true,
        "is_active" boolean NOT NULL DEFAULT true,
        "play_count" integer NOT NULL DEFAULT 0,
        "download_count" integer NOT NULL DEFAULT 0,
        "like_count" integer NOT NULL DEFAULT 0,
        "artist_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_albums" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_albums_slug" UNIQUE ("slug")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_albums_title_artist" ON "albums" ("title", "artist_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_albums_release_date" ON "albums" ("release_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_albums_status" ON "albums" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_albums_type" ON "albums" ("album_type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_albums_slug" ON "albums" ("slug")
    `);

    // Add foreign key constraint (assuming artists table exists)
    await queryRunner.query(`
      ALTER TABLE "albums" 
      ADD CONSTRAINT "FK_albums_artist" 
      FOREIGN KEY ("artist_id") 
      REFERENCES "artists"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "albums"`);
    await queryRunner.query(`DROP TYPE "album_genre_enum"`);
    await queryRunner.query(`DROP TYPE "album_status_enum"`);
    await queryRunner.query(`DROP TYPE "album_type_enum"`);
  }
}