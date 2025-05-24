import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlbumCredits1640000001000 implements MigrationInterface {
  name = 'CreateAlbumCredits1640000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create credit_role enum
    await queryRunner.query(`
      CREATE TYPE "credit_role_enum" AS ENUM(
        'producer', 'executive_producer', 'engineer', 'mixing_engineer',
        'mastering_engineer', 'songwriter', 'composer', 'arranger',
        'performer', 'featured_artist', 'backing_vocals', 'musician',
        'photographer', 'artwork_designer', 'liner_notes', 'a_and_r', 'other'
      )
    `);

    // Create album_credits table
    await queryRunner.query(`
      CREATE TABLE "album_credits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "role" "credit_role_enum" NOT NULL,
        "custom_role" character varying(255),
        "description" text,
        "order_index" integer NOT NULL DEFAULT 0,
        "album_id" uuid NOT NULL,
        CONSTRAINT "PK_album_credits" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_album_credits_album_role" ON "album_credits" ("album_id", "role")
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "album_credits" 
      ADD CONSTRAINT "FK_album_credits_album" 
      FOREIGN KEY ("album_id") 
      REFERENCES "albums"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "album_credits"`);
    await queryRunner.query(`DROP TYPE "credit_role_enum"`);
  }
}