import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArchiveTables1700000001 implements MigrationInterface {
  name = 'CreateArchiveTables1700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create archives table
    await queryRunner.query(`
      CREATE TYPE "archive_status_enum" AS ENUM('pending', 'processing', 'archived', 'verified', 'rejected');
      CREATE TYPE "preservation_quality_enum" AS ENUM('standard', 'high', 'master', 'original');
      CREATE TYPE "archive_type_enum" AS ENUM('music', 'document', 'photo', 'video', 'memorabilia', 'interview');
    `);

    await queryRunner.query(`
      CREATE TABLE "archives" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "archiveType" "archive_type_enum" NOT NULL DEFAULT 'music',
        "status" "archive_status_enum" NOT NULL DEFAULT 'pending',
        "preservationQuality" "preservation_quality_enum" NOT NULL DEFAULT 'standard',
        "historicalMetadata" jsonb,
        "preservationData" jsonb,
        "rightsInformation" jsonb,
        "storageLocation" character varying(500),
        "accessUrl" character varying(500),
        "isPubliclyAccessible" boolean NOT NULL DEFAULT false,
        "requiresPermission" boolean NOT NULL DEFAULT false,
        "accessConditions" text,
        "artistId" uuid,
        "trackId" uuid,
        "albumId" uuid,
        "contributorId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_archives" PRIMARY KEY ("id")
      )
    `);

    // Create archive_contributions table
    await queryRunner.query(`
      CREATE TYPE "contribution_type_enum" AS ENUM('submission', 'verification', 'metadata', 'digitization', 'restoration', 'documentation');
    `);

    await queryRunner.query(`
      CREATE TABLE "archive_contributions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "contributionType" "contribution_type_enum" NOT NULL,
        "description" text,
        "contributionData" jsonb,
        "archiveId" uuid NOT NULL,
        "contributorId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_archive_contributions" PRIMARY KEY ("id")
      )
    `);

    // Create archive_milestones table
    await queryRunner.query(`
      CREATE TYPE "milestone_type_enum" AS ENUM('creation', 'recording', 'release', 'performance', 'award', 'cultural_event', 'personal', 'career', 'historical');
    `);

    await queryRunner.query(`
      CREATE TABLE "archive_milestones" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "milestoneType" "milestone_type_enum" NOT NULL,
        "milestoneDate" date NOT NULL,
        "location" character varying(255),
        "additionalData" jsonb,
        "archiveId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_archive_milestones" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_archives_artist_status" ON "archives" ("artistId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_archives_type_created" ON "archives" ("archiveType", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_archives_quality_status" ON "archives" ("preservationQuality", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_milestones_archive_date" ON "archive_milestones" ("archiveId", "milestoneDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_milestones_type_date" ON "archive_milestones" ("milestoneType", "milestoneDate")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "archives" 
      ADD CONSTRAINT "FK_archives_artist" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "archives" 
      ADD CONSTRAINT "FK_archives_track" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "archives" 
      ADD CONSTRAINT "FK_archives_album" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "archives" 
      ADD CONSTRAINT "FK_archives_contributor" FOREIGN KEY ("contributorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "archive_contributions" 
      ADD CONSTRAINT "FK_contributions_archive" FOREIGN KEY ("archiveId") REFERENCES "archives"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "archive_contributions" 
      ADD CONSTRAINT "FK_contributions_contributor" FOREIGN KEY ("contributorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "archive_milestones" 
      ADD CONSTRAINT "FK_milestones_archive" FOREIGN KEY ("archiveId") REFERENCES "archives"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "archive_milestones"`);
    await queryRunner.query(`DROP TABLE "archive_contributions"`);
    await queryRunner.query(`DROP TABLE "archives"`);
    await queryRunner.query(`DROP TYPE "milestone_type_enum"`);
    await queryRunner.query(`DROP TYPE "contribution_type_enum"`);
    await queryRunner.query(`DROP TYPE "archive_type_enum"`);
    await queryRunner.query(`DROP TYPE "preservation_quality_enum"`);
    await queryRunner.query(`DROP TYPE "archive_status_enum"`);
  }
}