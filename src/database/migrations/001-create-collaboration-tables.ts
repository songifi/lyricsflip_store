import type { MigrationInterface, QueryRunner } from "typeorm"

export class CreateCollaborationTables1703000000001 implements MigrationInterface {
  name = "CreateCollaborationTables1703000000001"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create projects table
    await queryRunner.query(`
      CREATE TYPE "project_status_enum" AS ENUM('draft', 'active', 'on_hold', 'completed', 'archived');
      CREATE TYPE "project_type_enum" AS ENUM('track', 'album', 'ep', 'single', 'remix', 'collaboration');
    `)

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "type" "project_type_enum" NOT NULL DEFAULT 'track',
        "status" "project_status_enum" NOT NULL DEFAULT 'draft',
        "owner_id" uuid NOT NULL,
        "deadline" timestamp,
        "settings" jsonb,
        "metadata" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects" PRIMARY KEY ("id")
      )
    `)

    // Create project_members table
    await queryRunner.query(`
      CREATE TYPE "member_role_enum" AS ENUM('owner', 'admin', 'producer', 'artist', 'songwriter', 'engineer', 'viewer');
      CREATE TYPE "member_status_enum" AS ENUM('pending', 'active', 'inactive', 'removed');
    `)

    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "member_role_enum" NOT NULL DEFAULT 'viewer',
        "status" "member_status_enum" NOT NULL DEFAULT 'pending',
        "permissions" jsonb,
        "joined_at" timestamp,
        "last_active_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_project_members_project_user" UNIQUE ("project_id", "user_id")
      )
    `)

    // Create audio_versions table
    await queryRunner.query(`
      CREATE TYPE "audio_version_type_enum" AS ENUM('original', 'revision', 'master', 'demo', 'rough_mix', 'final_mix');
      CREATE TYPE "audio_version_status_enum" AS ENUM('draft', 'review', 'approved', 'rejected', 'archived');
    `)

    await queryRunner.query(`
      CREATE TABLE "audio_versions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "uploaded_by_id" uuid NOT NULL,
        "version_number" integer NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "type" "audio_version_type_enum" NOT NULL DEFAULT 'revision',
        "status" "audio_version_status_enum" NOT NULL DEFAULT 'draft',
        "file_url" character varying NOT NULL,
        "file_name" character varying NOT NULL,
        "file_size" integer NOT NULL,
        "file_format" character varying NOT NULL,
        "duration" integer,
        "waveform_data" jsonb,
        "metadata" jsonb,
        "changes" jsonb,
        "parent_version_id" uuid,
        "is_current_version" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audio_versions" PRIMARY KEY ("id")
      )
    `)

    // Create tasks table
    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM('todo', 'in_progress', 'review', 'completed', 'cancelled');
      CREATE TYPE "task_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent');
      CREATE TYPE "task_type_enum" AS ENUM('composition', 'recording', 'mixing', 'mastering', 'editing', 'review', 'approval', 'other');
    `)

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "created_by_id" uuid NOT NULL,
        "assignee_id" uuid,
        "title" character varying(255) NOT NULL,
        "description" text,
        "type" "task_type_enum" NOT NULL DEFAULT 'other',
        "status" "task_status_enum" NOT NULL DEFAULT 'todo',
        "priority" "task_priority_enum" NOT NULL DEFAULT 'medium',
        "due_date" timestamp,
        "started_at" timestamp,
        "completed_at" timestamp,
        "estimated_hours" integer,
        "actual_hours" integer,
        "attachments" jsonb,
        "dependencies" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
      )
    `)

    // Create feedback table
    await queryRunner.query(`
      CREATE TYPE "feedback_type_enum" AS ENUM('comment', 'suggestion', 'issue', 'approval', 'rejection');
      CREATE TYPE "feedback_status_enum" AS ENUM('pending', 'acknowledged', 'resolved', 'dismissed');
    `)

    await queryRunner.query(`
      CREATE TABLE "feedback" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "audio_version_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "type" "feedback_type_enum" NOT NULL DEFAULT 'comment',
        "status" "feedback_status_enum" NOT NULL DEFAULT 'pending',
        "content" text NOT NULL,
        "timestamp" integer,
        "rating" integer,
        "attachments" jsonb,
        "parent_feedback_id" uuid,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_feedback" PRIMARY KEY ("id")
      )
    `)

    // Create timeline table
    await queryRunner.query(`
      CREATE TYPE "timeline_event_type_enum" AS ENUM(
        'project_created', 'member_added', 'member_removed', 'audio_uploaded', 
        'audio_approved', 'task_created', 'task_completed', 'milestone_reached', 
        'feedback_added', 'status_changed', 'deadline_updated'
      );
    `)

    await queryRunner.query(`
      CREATE TABLE "timeline" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "user_id" uuid,
        "event_type" "timeline_event_type_enum" NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "metadata" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_timeline" PRIMARY KEY ("id")
      )
    `)

    // Create project_analytics table
    await queryRunner.query(`
      CREATE TABLE "project_analytics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "date" date NOT NULL,
        "metrics" jsonb NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_analytics" PRIMARY KEY ("id")
      )
    `)

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_projects_status_created_at" ON "projects" ("status", "created_at")`)
    await queryRunner.query(`CREATE INDEX "IDX_projects_owner_id_status" ON "projects" ("owner_id", "status")`)
    await queryRunner.query(
      `CREATE INDEX "IDX_project_members_project_id_status" ON "project_members" ("project_id", "status")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_audio_versions_project_id_version_number" ON "audio_versions" ("project_id", "version_number")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_audio_versions_project_id_status" ON "audio_versions" ("project_id", "status")`,
    )
    await queryRunner.query(`CREATE INDEX "IDX_tasks_project_id_status" ON "tasks" ("project_id", "status")`)
    await queryRunner.query(`CREATE INDEX "IDX_tasks_assignee_id_status" ON "tasks" ("assignee_id", "status")`)
    await queryRunner.query(
      `CREATE INDEX "IDX_feedback_audio_version_id_created_at" ON "feedback" ("audio_version_id", "created_at")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_feedback_author_id_created_at" ON "feedback" ("author_id", "created_at")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_timeline_project_id_created_at" ON "timeline" ("project_id", "created_at")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_project_analytics_project_id_date" ON "project_analytics" ("project_id", "date")`,
    )

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_project_members_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_project_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "audio_versions" ADD CONSTRAINT "FK_audio_versions_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "audio_versions" ADD CONSTRAINT "FK_audio_versions_uploaded_by" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "audio_versions" ADD CONSTRAINT "FK_audio_versions_parent" FOREIGN KEY ("parent_version_id") REFERENCES "audio_versions"("id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_feedback_audio_version" FOREIGN KEY ("audio_version_id") REFERENCES "audio_versions"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_feedback_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_feedback_parent" FOREIGN KEY ("parent_feedback_id") REFERENCES "feedback"("id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "timeline" ADD CONSTRAINT "FK_timeline_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "timeline" ADD CONSTRAINT "FK_timeline_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "project_analytics" ADD CONSTRAINT "FK_project_analytics_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "project_analytics"`)
    await queryRunner.query(`DROP TABLE "timeline"`)
    await queryRunner.query(`DROP TABLE "feedback"`)
    await queryRunner.query(`DROP TABLE "tasks"`)
    await queryRunner.query(`DROP TABLE "audio_versions"`)
    await queryRunner.query(`DROP TABLE "project_members"`)
    await queryRunner.query(`DROP TABLE "projects"`)

    // Drop enums
    await queryRunner.query(`DROP TYPE "timeline_event_type_enum"`)
    await queryRunner.query(`DROP TYPE "feedback_status_enum"`)
    await queryRunner.query(`DROP TYPE "feedback_type_enum"`)
    await queryRunner.query(`DROP TYPE "task_type_enum"`)
    await queryRunner.query(`DROP TYPE "task_priority_enum"`)
    await queryRunner.query(`DROP TYPE "task_status_enum"`)
    await queryRunner.query(`DROP TYPE "audio_version_status_enum"`)
    await queryRunner.query(`DROP TYPE "audio_version_type_enum"`)
    await queryRunner.query(`DROP TYPE "member_status_enum"`)
    await queryRunner.query(`DROP TYPE "member_role_enum"`)
    await queryRunner.query(`DROP TYPE "project_type_enum"`)
    await queryRunner.query(`DROP TYPE "project_status_enum"`)
  }
}
