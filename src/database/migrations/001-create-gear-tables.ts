import type { MigrationInterface, QueryRunner } from "typeorm"

export class CreateGearTables1703001000000 implements MigrationInterface {
  name = "CreateGearTables1703001000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create gear table
    await queryRunner.query(`
      CREATE TYPE "gear_category_enum" AS ENUM (
        'guitars', 'bass', 'drums', 'keyboards', 'amplifiers', 
        'effects', 'recording', 'dj_equipment', 'orchestral', 
        'wind_instruments', 'accessories'
      )
    `)

    await queryRunner.query(`
      CREATE TYPE "gear_condition_enum" AS ENUM (
        'new', 'excellent', 'very_good', 'good', 'fair', 'poor'
      )
    `)

    await queryRunner.query(`
      CREATE TYPE "gear_status_enum" AS ENUM (
        'draft', 'active', 'sold', 'rented', 'suspended', 'deleted'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "gear" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "category" "gear_category_enum" NOT NULL,
        "brand" character varying(100) NOT NULL,
        "model" character varying(100) NOT NULL,
        "year" character varying(50),
        "serialNumber" character varying(100),
        "condition" "gear_condition_enum" NOT NULL,
        "conditionNotes" text,
        "price" numeric(10,2) NOT NULL,
        "originalPrice" numeric(10,2),
        "rentalPriceDaily" numeric(10,2),
        "rentalPriceWeekly" numeric(10,2),
        "rentalPriceMonthly" numeric(10,2),
        "specifications" jsonb,
        "features" jsonb,
        "includedAccessories" jsonb,
        "status" "gear_status_enum" NOT NULL DEFAULT 'draft',
        "isVerified" boolean NOT NULL DEFAULT false,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "allowsRental" boolean NOT NULL DEFAULT false,
        "requiresInsurance" boolean NOT NULL DEFAULT false,
        "weight" numeric(5,2),
        "dimensions" jsonb,
        "location" character varying(100),
        "viewCount" integer NOT NULL DEFAULT 0,
        "favoriteCount" integer NOT NULL DEFAULT 0,
        "sellerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gear" PRIMARY KEY ("id")
      )
    `)

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_gear_category_status" ON "gear" ("category", "status")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_gear_seller_status" ON "gear" ("sellerId", "status")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_gear_price" ON "gear" ("price")
    `)

    // Create gear_images table
    await queryRunner.query(`
      CREATE TABLE "gear_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying(500) NOT NULL,
        "alt" character varying(255),
        "sortOrder" integer NOT NULL DEFAULT 0,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "gearId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gear_images" PRIMARY KEY ("id")
      )
    `)

    // Create gear_rentals table
    await queryRunner.query(`
      CREATE TYPE "rental_status_enum" AS ENUM (
        'pending', 'confirmed', 'active', 'completed', 'cancelled', 'overdue'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "gear_rentals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "gearId" uuid NOT NULL,
        "renterId" uuid NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "totalPrice" numeric(10,2) NOT NULL,
        "securityDeposit" numeric(10,2) NOT NULL,
        "status" "rental_status_enum" NOT NULL DEFAULT 'pending',
        "notes" text,
        "returnConditionNotes" text,
        "insuranceRequired" boolean NOT NULL DEFAULT false,
        "insuranceCost" numeric(10,2),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gear_rentals" PRIMARY KEY ("id")
      )
    `)

    // Create gear_verifications table
    await queryRunner.query(`
      CREATE TYPE "verification_status_enum" AS ENUM (
        'pending', 'approved', 'rejected', 'requires_info'
      )
    `)

    await queryRunner.query(`
      CREATE TYPE "verification_type_enum" AS ENUM (
        'authenticity', 'condition', 'ownership', 'technical'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "gear_verifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "gearId" uuid NOT NULL,
        "verifierId" uuid,
        "type" "verification_type_enum" NOT NULL,
        "status" "verification_status_enum" NOT NULL DEFAULT 'pending',
        "notes" text,
        "evidence" jsonb,
        "verificationData" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gear_verifications" PRIMARY KEY ("id")
      )
    `)

    // Create gear_shipping table
    await queryRunner.query(`
      CREATE TYPE "shipping_method_enum" AS ENUM (
        'standard', 'express', 'overnight', 'white_glove', 'local_pickup', 'freight'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "gear_shipping" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "gearId" uuid NOT NULL,
        "method" "shipping_method_enum" NOT NULL,
        "cost" numeric(10,2) NOT NULL,
        "estimatedDays" integer NOT NULL,
        "insuranceIncluded" boolean NOT NULL DEFAULT false,
        "insuranceCost" numeric(10,2),
        "trackingIncluded" boolean NOT NULL DEFAULT false,
        "description" text,
        "restrictions" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gear_shipping" PRIMARY KEY ("id")
      )
    `)

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "gear_images" 
      ADD CONSTRAINT "FK_gear_images_gear" 
      FOREIGN KEY ("gearId") REFERENCES "gear"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "gear_rentals" 
      ADD CONSTRAINT "FK_gear_rentals_gear" 
      FOREIGN KEY ("gearId") REFERENCES "gear"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "gear_verifications" 
      ADD CONSTRAINT "FK_gear_verifications_gear" 
      FOREIGN KEY ("gearId") REFERENCES "gear"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "gear_shipping" 
      ADD CONSTRAINT "FK_gear_shipping_gear" 
      FOREIGN KEY ("gearId") REFERENCES "gear"("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gear_shipping"`)
    await queryRunner.query(`DROP TABLE "gear_verifications"`)
    await queryRunner.query(`DROP TABLE "gear_rentals"`)
    await queryRunner.query(`DROP TABLE "gear_images"`)
    await queryRunner.query(`DROP TABLE "gear"`)
    await queryRunner.query(`DROP TYPE "shipping_method_enum"`)
    await queryRunner.query(`DROP TYPE "verification_type_enum"`)
    await queryRunner.query(`DROP TYPE "verification_status_enum"`)
    await queryRunner.query(`DROP TYPE "rental_status_enum"`)
    await queryRunner.query(`DROP TYPE "gear_status_enum"`)
    await queryRunner.query(`DROP TYPE "gear_condition_enum"`)
    await queryRunner.query(`DROP TYPE "gear_category_enum"`)
  }
}
