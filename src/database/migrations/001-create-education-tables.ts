import { type MigrationInterface, type QueryRunner, Table, Index, ForeignKey } from "typeorm"

export class CreateEducationTables1703001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create courses table
    await queryRunner.createTable(
      new Table({
        name: "courses",
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
            length: "255",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "shortDescription",
            type: "text",
            isNullable: true,
          },
          {
            name: "thumbnailUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "previewVideoUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "level",
            type: "enum",
            enum: ["beginner", "intermediate", "advanced", "expert"],
            default: "'beginner'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["draft", "published", "archived"],
            default: "'draft'",
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "estimatedDurationMinutes",
            type: "int",
            default: 0,
          },
          {
            name: "tags",
            type: "text",
            isNullable: true,
          },
          {
            name: "prerequisites",
            type: "text",
            isNullable: true,
          },
          {
            name: "learningObjectives",
            type: "text",
            isNullable: true,
          },
          {
            name: "enrollmentCount",
            type: "int",
            default: 0,
          },
          {
            name: "averageRating",
            type: "decimal",
            precision: 3,
            scale: 2,
            default: 0,
          },
          {
            name: "reviewCount",
            type: "int",
            default: 0,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "instructorId",
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
      }),
      true,
    )

    // Create lessons table
    await queryRunner.createTable(
      new Table({
        name: "lessons",
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
            length: "255",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "content",
            type: "text",
            isNullable: true,
          },
          {
            name: "type",
            type: "enum",
            enum: ["video", "text", "interactive", "quiz", "assignment"],
            default: "'video'",
          },
          {
            name: "orderIndex",
            type: "int",
            default: 0,
          },
          {
            name: "estimatedDurationMinutes",
            type: "int",
            default: 0,
          },
          {
            name: "isPreview",
            type: "boolean",
            default: false,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "resources",
            type: "text",
            isNullable: true,
          },
          {
            name: "courseId",
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
      }),
      true,
    )

    // Create video_tutorials table
    await queryRunner.createTable(
      new Table({
        name: "video_tutorials",
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
            length: "255",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "videoUrl",
            type: "varchar",
          },
          {
            name: "thumbnailUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "durationSeconds",
            type: "int",
            default: 0,
          },
          {
            name: "quality",
            type: "enum",
            enum: ["480p", "720p", "1080p", "4K"],
            default: "'720p'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["uploading", "processing", "ready", "error"],
            default: "'uploading'",
          },
          {
            name: "fileSize",
            type: "bigint",
            default: 0,
          },
          {
            name: "streamingUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "chapters",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "subtitles",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "viewCount",
            type: "int",
            default: 0,
          },
          {
            name: "orderIndex",
            type: "int",
            default: 0,
          },
          {
            name: "lessonId",
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
      }),
      true,
    )

    // Create student_progress table
    await queryRunner.createTable(
      new Table({
        name: "student_progress",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "studentId",
            type: "uuid",
          },
          {
            name: "courseId",
            type: "uuid",
          },
          {
            name: "status",
            type: "enum",
            enum: ["not_started", "in_progress", "completed", "paused"],
            default: "'not_started'",
          },
          {
            name: "completionPercentage",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: "lessonsCompleted",
            type: "int",
            default: 0,
          },
          {
            name: "totalLessons",
            type: "int",
            default: 0,
          },
          {
            name: "exercisesCompleted",
            type: "int",
            default: 0,
          },
          {
            name: "totalExercises",
            type: "int",
            default: 0,
          },
          {
            name: "assignmentsCompleted",
            type: "int",
            default: 0,
          },
          {
            name: "totalAssignments",
            type: "int",
            default: 0,
          },
          {
            name: "totalTimeSpentMinutes",
            type: "int",
            default: 0,
          },
          {
            name: "totalScore",
            type: "int",
            default: 0,
          },
          {
            name: "maxPossibleScore",
            type: "int",
            default: 0,
          },
          {
            name: "averageScore",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: "lastAccessedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "completedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "enrolledAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "streakData",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "preferences",
            type: "jsonb",
            isNullable: true,
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
      true,
    )

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      "courses",
      new ForeignKey({
        columnNames: ["instructorId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "lessons",
      new ForeignKey({
        columnNames: ["courseId"],
        referencedTableName: "courses",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "video_tutorials",
      new ForeignKey({
        columnNames: ["lessonId"],
        referencedTableName: "lessons",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "student_progress",
      new ForeignKey({
        columnNames: ["studentId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    await queryRunner.createForeignKey(
      "student_progress",
      new ForeignKey({
        columnNames: ["courseId"],
        referencedTableName: "courses",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    )

    // Create indexes
    await queryRunner.createIndex("courses", new Index("IDX_courses_instructor", ["instructorId"]))
    await queryRunner.createIndex("courses", new Index("IDX_courses_status", ["status"]))
    await queryRunner.createIndex("courses", new Index("IDX_courses_level", ["level"]))
    await queryRunner.createIndex("lessons", new Index("IDX_lessons_course", ["courseId"]))
    await queryRunner.createIndex("lessons", new Index("IDX_lessons_order", ["courseId", "orderIndex"]))
    await queryRunner.createIndex(
      "student_progress",
      new Index("IDX_progress_student_course", ["studentId", "courseId"], { isUnique: true }),
    )
    await queryRunner.createIndex("student_progress", new Index("IDX_progress_status", ["status"]))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("video_tutorials")
    await queryRunner.dropTable("student_progress")
    await queryRunner.dropTable("lessons")
    await queryRunner.dropTable("courses")
  }
}
