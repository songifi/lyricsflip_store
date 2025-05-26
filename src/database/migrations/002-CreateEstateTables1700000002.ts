import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEstateTables1700000002 implements MigrationInterface {
  name = 'CreateEstateTables1700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create estate status enum
    await queryRunner.query(`
      CREATE TYPE "estate_status_enum" AS ENUM('active', 'probate', 'settled', 'disputed', 'inactive');
    `);

    // Create estates table
    await queryRunner.query(`
      CREATE TABLE "estates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "estateName" character varying(255) NOT NULL,
        "status" "estate_status_enum" NOT NULL DEFAULT 'active',
        "establishedDate" date,
        "artistDeathDate" date,
        "legalInformation" jsonb,
        "financialInformation" jsonb,
        "artistId" uuid NOT NULL,
        "primaryContactId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_estates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_estates_artist" UNIQUE ("artistId")
      )
    `);

    // Create estate rights enums and table
    await queryRunner.query(`
      CREATE TYPE "rights_type_enum" AS ENUM('copyright', 'publishing', 'master_recording', 'mechanical', 'performance', 'synchronization', 'merchandising', 'name_likeness', 'trademark');
      CREATE TYPE "rights_status_enum" AS ENUM('active', 'expired', 'disputed', 'transferred', 'licensed');
    `);

    await queryRunner.query(`
      CREATE TABLE "estate_rights" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rightsType" "rights_type_enum" NOT NULL,
        "status" "rights_status_enum" NOT NULL DEFAULT 'active',
        "description" character varying(255) NOT NULL,
        "acquisitionDate" date,
        "expirationDate" date,
        "territory" character varying(255),
        "ownershipPercentage" decimal(5,2),
        "rightsDetails" jsonb,
        "estateId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_estate_rights" PRIMARY KEY ("id")
      )
    `);

    // Create estate inheritance enums and table
    await queryRunner.query(`
      CREATE TYPE "inheritance_type_enum" AS ENUM('heir', 'beneficiary', 'executor', 'trustee', 'legal_representative');
      CREATE TYPE "inheritance_status_enum" AS ENUM('active', 'pending', 'disputed', 'revoked', 'transferred');
    `);

    await queryRunner.query(`
      CREATE TABLE "estate_inheritances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inheritanceType" "inheritance_type_enum" NOT NULL,
        "status" "inheritance_status_enum" NOT NULL DEFAULT 'active',
        "inheritancePercentage" decimal(5,2),
        "relationshipToArtist" character varying(255),
        "effectiveDate" date,
        "inheritanceDetails" jsonb,
        "estateId" uuid NOT NULL,
        "inheriteeId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_estate_inheritances" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_estates_artist_status" ON "estates" ("artistId", "status")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "estates" 
      ADD CONSTRAINT "FK_estates_artist" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "estates" 
      ADD CONSTRAINT "FK_estates_primary_contact" FOREIGN KEY ("primaryContactId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "estate_rights" 
      ADD CONSTRAINT "FK_estate_rights_estate" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "estate_inheritances" 
      ADD CONSTRAINT "FK_estate_inheritances_estate" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "estate_inheritances" 
      ADD CONSTRAINT "FK_estate_inheritances_inheritee" FOREIGN KEY ("inheriteeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "estate_inheritances"`);
    await queryRunner.query(`DROP TABLE "estate_rights"`);
    await queryRunner.query(`DROP TABLE "estates"`);
    await queryRunner.query(`DROP TYPE "inheritance_status_enum"`);
    await queryRunner.query(`DROP TYPE "inheritance_type_enum"`);
    await queryRunner.query(`DROP TYPE "rights_status_enum"`);
    await queryRunner.query(`DROP TYPE "rights_type_enum"`);
    await queryRunner.query(`DROP TYPE "estate_status_enum"`);
  }
}