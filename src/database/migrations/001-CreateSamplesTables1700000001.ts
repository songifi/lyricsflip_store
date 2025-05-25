import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSamplesTables1700000001 implements MigrationInterface {
  name = 'CreateSamplesTables1700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sample_tags table
    await queryRunner.query(`
      CREATE TABLE "sample_tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "category" character varying NOT NULL DEFAULT 'custom',
        "description" text,
        "color" character varying NOT NULL DEFAULT '#6B7280',
        "usage_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_sample_tags_name" UNIQUE ("name"),
        CONSTRAINT "PK_sample_tags" PRIMARY KEY ("id")
      )
    `);

    // Create samples table
    await queryRunner.query(`
      CREATE TABLE "samples" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'draft',
        "file_url" character varying NOT NULL,
        "preview_url" character varying,
        "file_size" integer NOT NULL,
        "duration" numeric NOT NULL,
        "sample_rate" integer NOT NULL DEFAULT 44100,
        "bit_depth" integer NOT NULL DEFAULT 16,
        "key" character varying(10),
        "bpm" integer,
        "price" numeric(10,2) NOT NULL,
        "discount" numeric(5,2) NOT NULL DEFAULT 0,
        "allows_exclusive_licensing" boolean NOT NULL DEFAULT true,
        "exclusive_price" numeric(10,2),
        "is_exclusively_licensed" boolean NOT NULL DEFAULT false,
        "exclusive_licensee_id" uuid,
        "play_count" integer NOT NULL DEFAULT 0,
        "download_count" integer NOT NULL DEFAULT 0,
        "like_count" integer NOT NULL DEFAULT 0,
        "view_count" integer NOT NULL DEFAULT 0,
        "metadata" text,
        "creator_id" uuid NOT NULL,
        "artist_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_samples" PRIMARY KEY ("id")
      )
    `);

    // Create sample_packs table
    await queryRunner.query(`
      CREATE TABLE "sample_packs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "status" character varying NOT NULL DEFAULT 'draft',
        "cover_image_url" character varying,
        "price" numeric(10,2) NOT NULL,
        "discount" numeric(5,2) NOT NULL DEFAULT 0,
        "bundle_discount" numeric(5,2) NOT NULL DEFAULT 0,
        "download_count" integer NOT NULL DEFAULT 0,
        "view_count" integer NOT NULL DEFAULT 0,
        "creator_id" uuid NOT NULL,
        "artist_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sample_packs" PRIMARY KEY ("id")
      )
    `);

    // Create sample_licenses table
    await queryRunner.query(`
      CREATE TABLE "sample_licenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "terms" text NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "royalty_rate" numeric(5,2) NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMP,
        "activated_at" TIMESTAMP,
        "sample_id" uuid NOT NULL,
        "licensee_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sample_licenses" PRIMARY KEY ("id")
      )
    `);

    // Create sample_usages table
    await queryRunner.query(`
      CREATE TABLE "sample_usages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "context" character varying,
        "ip_address" character varying,
        "user_agent" character varying,
        "referrer" character varying,
        "metadata" text,
        "sample_id" uuid NOT NULL,
        "user_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sample_usages" PRIMARY KEY ("id")
      )
    `);

    // Create sample_royalties table
    await queryRunner.query(`
      CREATE TABLE "sample_royalties" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "amount" numeric(10,2) NOT NULL,
        "rate" numeric(5,2) NOT NULL,
        "gross_revenue" numeric(10,2) NOT NULL,
        "usage_count" integer NOT NULL,
        "period_start" TIMESTAMP NOT NULL,
        "period_end" TIMESTAMP NOT NULL,
        "calculated_at" TIMESTAMP,
        "paid_at" TIMESTAMP,
        "metadata" text,
        "sample_id" uuid NOT NULL,
        "creator_id" uuid NOT NULL,
        "license_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sample_royalties" PRIMARY KEY ("id")
      )
    `);

    // Create junction tables
    await queryRunner.query(`
      CREATE TABLE "sample_genres" (
        "sample_id" uuid NOT NULL,
        "genre_id" uuid NOT NULL,
        CONSTRAINT "PK_sample_genres" PRIMARY KEY ("sample_id", "genre_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sample_sample_tags" (
        "sample_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_sample_sample_tags" PRIMARY KEY ("sample_id", "tag_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sample_pack_samples" (
        "pack_id" uuid NOT NULL,
        "sample_id" uuid NOT NULL,
        CONSTRAINT "PK_sample_pack_samples" PRIMARY KEY ("pack_id", "sample_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sample_pack_genres" (
        "pack_id" uuid NOT NULL,
        "genre_id" uuid NOT NULL,
        CONSTRAINT "PK_sample_pack_genres" PRIMARY KEY ("pack_id", "genre_id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_samples_status_created_at" ON "samples" ("status", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_samples_type_status" ON "samples" ("type", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_samples_creator_id_status" ON "samples" ("creator_id", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_licenses_licensee_id_status" ON "sample_licenses" ("licensee_id", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_licenses_sample_id_type" ON "sample_licenses" ("sample_id", "type")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_usages_sample_id_created_at" ON "sample_usages" ("sample_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_usages_user_id_type" ON "sample_usages" ("user_id", "type")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_usages_type_created_at" ON "sample_usages" ("type", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_royalties_creator_id_status" ON "sample_royalties" ("creator_id", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_royalties_sample_id_period" ON "sample_royalties" ("sample_id", "period_start", "period_end")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_tags_name_category" ON "sample_tags" ("name", "category")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_packs_status_created_at" ON "sample_packs" ("status", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_sample_packs_creator_id_status" ON "sample_packs" ("creator_id", "status")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "samples" 
      ADD CONSTRAINT "FK_samples_creator_id" 
      FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "samples" 
      ADD CONSTRAINT "FK_samples_artist_id" 
      FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_packs" 
      ADD CONSTRAINT "FK_sample_packs_creator_id" 
      FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_packs" 
      ADD CONSTRAINT "FK_sample_packs_artist_id" 
      FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_licenses" 
      ADD CONSTRAINT "FK_sample_licenses_sample_id" 
      FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_licenses" 
      ADD CONSTRAINT "FK_sample_licenses_licensee_id" 
      FOREIGN KEY ("licensee_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_usages" 
      ADD CONSTRAINT "FK_sample_usages_sample_id" 
      FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_usages" 
      ADD CONSTRAINT "FK_sample_usages_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_royalties" 
      ADD CONSTRAINT "FK_sample_royalties_sample_id" 
      FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_royalties" 
      ADD CONSTRAINT "FK_sample_royalties_creator_id" 
      FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_royalties" 
      ADD CONSTRAINT "FK_sample_royalties_license_id" 
      FOREIGN KEY ("license_id") REFERENCES "sample_licenses"("id") ON DELETE SET NULL
    `);

    // Junction table foreign keys
    await queryRunner.query(`
      ALTER TABLE "sample_genres" 
      ADD CONSTRAINT "FK_sample_genres_sample_id" 
      FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_genres" 
      ADD CONSTRAINT "FK_sample_genres_genre_id" 
      FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_sample_tags" 
      ADD CONSTRAINT "FK_sample_sample_tags_sample_id" 
      FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_sample_tags" 
      ADD CONSTRAINT "FK_sample_sample_tags_tag_id" 
      FOREIGN KEY ("tag_id") REFERENCES "sample_tags"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_pack_samples" 
      ADD CONSTRAINT "FK_sample_pack_samples_pack_id" 
      FOREIGN KEY ("pack_id") REFERENCES "sample_packs"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_pack_samples" 
      ADD CONSTRAINT "FK_sample_pack_samples_sample_id" 
      FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_pack_genres" 
      ADD CONSTRAINT "FK_sample_pack_genres_pack_id" 
      FOREIGN KEY ("pack_id") REFERENCES "sample_packs"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sample_pack_genres" 
      ADD CONSTRAINT "FK_sample_pack_genres_genre_id" 
      FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "sample_pack_genres" DROP CONSTRAINT "FK_sample_pack_genres_genre_id"`);
    await queryRunner.query(`ALTER TABLE "sample_pack_genres" DROP CONSTRAINT "FK_sample_pack_genres_pack_id"`);
    await queryRunner.query(`ALTER TABLE "sample_pack_samples" DROP CONSTRAINT "FK_sample_pack_samples_sample_id"`);
    await queryRunner.query(`ALTER TABLE "sample_pack_samples" DROP CONSTRAINT "FK_sample_pack_samples_pack_id"`);
    await queryRunner.query(`ALTER TABLE "sample_sample_tags" DROP CONSTRAINT "FK_sample_sample_tags_tag_id"`);
    await queryRunner.query(`ALTER TABLE "sample_sample_tags" DROP CONSTRAINT "FK_sample_sample_tags_sample_id"`);
    await queryRunner.query(`ALTER TABLE "sample_genres" DROP CONSTRAINT "FK_sample_genres_genre_id"`);
    await queryRunner.query(`ALTER TABLE "sample_genres" DROP CONSTRAINT "FK_sample_genres_sample_id"`);
    await queryRunner.query(`ALTER TABLE "sample_royalties" DROP CONSTRAINT "FK_sample_royalties_license_id"`);
    await queryRunner.query(`ALTER TABLE "sample_royalties" DROP CONSTRAINT "FK_sample_royalties_creator_id"`);
    await queryRunner.query(`ALTER TABLE "sample_royalties" DROP CONSTRAINT "FK_sample_royalties_sample_id"`);
    await queryRunner.query(`ALTER TABLE "sample_usages" DROP CONSTRAINT "FK_sample_usages_user_id"`);
    await queryRunner.query(`ALTER TABLE "sample_usages" DROP CONSTRAINT "FK_sample_usages_sample_id"`);
    await queryRunner.query(`ALTER TABLE "sample_licenses" DROP CONSTRAINT "FK_sample_licenses_licensee_id"`);
    await queryRunner.query(`ALTER TABLE "sample_licenses" DROP CONSTRAINT "FK_sample_licenses_sample_id"`);
    await queryRunner.query(`ALTER TABLE "sample_packs" DROP CONSTRAINT "FK_sample_packs_artist_id"`);
    await queryRunner.query(`ALTER TABLE "sample_packs" DROP CONSTRAINT "FK_sample_packs_creator_id"`);
    await queryRunner.query(`ALTER TABLE "samples" DROP CONSTRAINT "FK_samples_artist_id"`);
    await queryRunner.query(`ALTER TABLE "samples" DROP CONSTRAINT "FK_samples_creator_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_sample_packs_creator_id_status"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_packs_status_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_tags_name_category"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_royalties_sample_id_period"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_royalties_creator_id_status"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_usages_type_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_usages_user_id_type"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_usages_sample_id_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_licenses_sample_id_type"`);
    await queryRunner.query(`DROP INDEX "IDX_sample_licenses_licensee_id_status"`);
    await queryRunner.query(`DROP INDEX "IDX_samples_creator_id_status"`);
    await queryRunner.query(`DROP INDEX "IDX_samples_type_status"`);
    await queryRunner.query(`DROP INDEX "IDX_samples_status_created_at"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "sample_pack_genres"`);
    await queryRunner.query(`DROP TABLE "sample_pack_samples"`);
    await queryRunner.query(`DROP TABLE "sample_sample_tags"`);
    await queryRunner.query(`DROP TABLE "sample_genres"`);
    await queryRunner.query(`DROP TABLE "sample_royalties"`);
    await queryRunner.query(`DROP TABLE "sample_usages"`);
    await queryRunner.query(`DROP TABLE "sample_licenses"`);
    await queryRunner.query(`DROP TABLE "sample_packs"`);
    await queryRunner.query(`DROP TABLE "samples"`);
    await queryRunner.query(`DROP TABLE "sample_tags"`);
  }
}