import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1716465622000 implements MigrationInterface {
  name = 'Init1716465622000ialSchema';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tracks table
    await queryRunner.query(`
      CREATE TABLE "tracks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "title" character varying(255) NOT NULL,
        "description" text,
        "duration" integer NOT NULL DEFAULT 0,
        "artist_id" uuid NOT NULL,
        "album_id" uuid,
        "audio_url" character varying(255) NOT NULL,
        "cover_image_url" character varying(255),
        "play_count" integer NOT NULL DEFAULT 0,
        "rating" decimal(3,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_tracks" PRIMARY KEY ("id")
      )
    `);

    // Create artists table
    await queryRunner.query(`
      CREATE TABLE "artists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "bio" text,
        "profile_image_url" character varying(255),
        "user_id" uuid,
        CONSTRAINT "PK_artists" PRIMARY KEY ("id")
      )
    `);

    // Create albums table
    await queryRunner.query(`
      CREATE TABLE "albums" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "title" character varying(255) NOT NULL,
        "release_date" TIMESTAMP,
        "cover_image_url" character varying(255),
        "artist_id" uuid NOT NULL,
        CONSTRAINT "PK_albums" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "tracks" ADD CONSTRAINT "FK_tracks_artists" 
      FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tracks" ADD CONSTRAINT "FK_tracks_albums" 
      FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "albums" ADD CONSTRAINT "FK_albums_artists" 
      FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "tracks" DROP CONSTRAINT "FK_tracks_albums"`);
    await queryRunner.query(`ALTER TABLE "tracks" DROP CONSTRAINT "FK_tracks_artists"`);
    await queryRunner.query(`ALTER TABLE "albums" DROP CONSTRAINT "FK_albums_artists"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "tracks"`);
    await queryRunner.query(`DROP TABLE "albums"`);
    await queryRunner.query(`DROP TABLE "artists"`);
  }
}