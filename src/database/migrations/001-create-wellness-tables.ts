import { type MigrationInterface, type QueryRunner, Table } from "typeorm"

export class CreateWellnessTables1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Wellness Categories
    await queryRunner.createTable(
      new Table({
        name: "wellness_categories",
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
            isUnique: true,
          },
          {
            name: "category",
            type: "enum",
            enum: [
              "anxiety_relief",
              "depression_support",
              "stress_reduction",
              "sleep_improvement",
              "focus_enhancement",
              "pain_management",
              "emotional_healing",
              "trauma_recovery",
              "addiction_recovery",
              "mindfulness",
              "meditation",
              "breathwork",
              "binaural_beats",
              "frequency_therapy",
            ],
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "scientificBasis",
            type: "text",
            isNullable: true,
          },
          {
            name: "targetConditions",
            type: "text",
            isNullable: true,
          },
          {
            name: "contraindications",
            type: "text",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    )

    // Wellness Programs
    await queryRunner.createTable(
      new Table({
        name: "wellness_programs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "type",
            type: "enum",
            enum: [
              "guided_meditation",
              "music_therapy",
              "frequency_therapy",
              "breathwork",
              "progressive_relaxation",
              "mindfulness",
            ],
          },
          {
            name: "difficulty",
            type: "enum",
            enum: ["beginner", "intermediate", "advanced"],
          },
          {
            name: "durationMinutes",
            type: "int",
          },
          {
            name: "totalSessions",
            type: "int",
          },
          {
            name: "tags",
            type: "text",
            isNullable: true,
          },
          {
            name: "instructions",
            type: "text",
            isNullable: true,
          },
          {
            name: "benefits",
            type: "text",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "categoryId",
            type: "uuid",
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["categoryId"],
            referencedTableName: "wellness_categories",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
    )

    // Continue with other tables...
    // (Additional tables would follow the same pattern)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("wellness_programs")
    await queryRunner.dropTable("wellness_categories")
    // Drop other tables in reverse order
  }
}
