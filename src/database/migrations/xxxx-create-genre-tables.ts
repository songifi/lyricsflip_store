import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGenreTables1703000000000 implements MigrationInterface {
  name = 'CreateGenreTables1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create genres table
    await queryRunner.query(`
      CREATE TABLE "genres" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(150) NOT NULL,
        "description" text,
        "colorCode" character varying(7),
        "moods" "enum_genres_moods" array NOT NULL DEFAULT '{}',
        "energyLevel" "enum_genres_energylevel" NOT NULL DEFAULT '3',
        "popularity" numeric(3,2) NOT NULL DEFAULT '0',
        "trackCount" integer NOT NULL DEFAULT '0',
        "albumCount" integer NOT NULL DEFAULT '0',
        "artistCount" integer NOT NULL DEFAULT '0',
        "isActive" boolean NOT NULL DEFAULT true,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_genres" PRIMARY KEY ("id")
      )
    `);

    // Create genre moods enum
    await queryRunner.query(`
      CREATE TYPE "enum_genres_moods" AS ENUM(
        'energetic',
        'melancholic',
        'uplifting',
        'aggressive',
        'peaceful',
        'romantic',
        'dark',
        'nostalgic',
        'mysterious',
        'euphoric'
      )
    `);

    // Create genre energy level enum
    await queryRunner.query(`
      CREATE TYPE "enum_genres_energylevel" AS ENUM('1', '2', '3', '4', '5')
    `);

    // Create genre closure table for hierarchical structure
    await queryRunner.query(`
      CREATE TABLE "genres_closure" (
        "id_ancestor" uuid NOT NULL,
        "id_descendant" uuid NOT NULL,
        CONSTRAINT "PK_genres_closure" PRIMARY KEY ("id_ancestor", "id_descendant")
      )
    `);

    // Create genre popularity history table
    await queryRunner.query(`
      CREATE TABLE "genre_popularity_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "genreId" uuid NOT NULL,
        "popularity" numeric(3,2) NOT NULL,
        "trackCount" integer NOT NULL DEFAULT '0',
        "streamCount" integer NOT NULL DEFAULT '0',
        "recordedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_genre_popularity_history" PRIMARY KEY ("id")
      )
    `);

    // Create genre related genres junction table
    await queryRunner.query(`
      CREATE TABLE "genre_related_genres" (
        "genreId_1" uuid NOT NULL,
        "genreId_2" uuid NOT NULL,
        CONSTRAINT "PK_genre_related_genres" PRIMARY KEY ("genreId_1", "genreId_2")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_genres_slug" ON "genres" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_genres_isActive" ON "genres" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_genres_popularity" ON "genres" ("popularity")`);
    await queryRunner.query(`CREATE INDEX "IDX_genres_closure_ancestor" ON "genres_closure" ("id_ancestor")`);
    await queryRunner.query(`CREATE INDEX "IDX_genres_closure_descendant" ON "genres_closure" ("id_descendant")`);
    await queryRunner.query(`CREATE INDEX "IDX_genre_popularity_history_genre_recordedAt" ON "genre_popularity_history" ("genreId", "recordedAt")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "genres_closure"
      ADD CONSTRAINT "FK_genres_closure_ancestor"
      FOREIGN KEY ("id_ancestor") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "genres_closure"
      ADD CONSTRAINT "FK_genres_closure_descendant"
      FOREIGN KEY ("id_descendant") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "genre_popularity_history"
      ADD CONSTRAINT "FK_genre_popularity_history_genre"
      FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "genre_related_genres"
      ADD CONSTRAINT "FK_genre_related_genres_1"
      FOREIGN KEY ("genreId_1") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "genre_related_genres"
      ADD CONSTRAINT "FK_genre_related_genres_2"
      FOREIGN KEY ("genreId_2") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Create trigger for updating updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_genres_updated_at
      BEFORE UPDATE ON "genres"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_genres_updated_at ON "genres"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "genre_related_genres" DROP CONSTRAINT "FK_genre_related_genres_2"`);
    await queryRunner.query(`ALTER TABLE "genre_related_genres" DROP CONSTRAINT "FK_genre_related_genres_1"`);
    await queryRunner.query(`ALTER TABLE "genre_popularity_history" DROP CONSTRAINT "FK_genre_popularity_history_genre"`);
    await queryRunner.query(`ALTER TABLE "genres_closure" DROP CONSTRAINT "FK_genres_closure_descendant"`);
    await queryRunner.query(`ALTER TABLE "genres_closure" DROP CONSTRAINT "FK_genres_closure_ancestor"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_genre_popularity_history_genre_recordedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_genres_closure_descendant"`);
    await queryRunner.query(`DROP INDEX "IDX_genres_closure_ancestor"`);
    await queryRunner.query(`DROP INDEX "IDX_genres_popularity"`);
    await queryRunner.query(`DROP INDEX "IDX_genres_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_genres_slug"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "genre_related_genres"`);
    await queryRunner.query(`DROP TABLE "genre_popularity_history"`);
    await queryRunner.query(`DROP TABLE "genres_closure"`);
    await queryRunner.query(`DROP TABLE "genres"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "enum_genres_energylevel"`);
    await queryRunner.query(`DROP TYPE "enum_genres_moods"`);
  }
}