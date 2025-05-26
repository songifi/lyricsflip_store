import { MigrationInterface, QueryRunner, Table, ForeignKey } from 'typeorm';

export class CreateLabelsTables1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create labels table
    await queryRunner.createTable(
      new Table({
        name: 'labels',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'website',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'logo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended'],
            default: "'active'",
          },
          {
            name: 'social_media',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'default_royalty_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'business_info',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'owner_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create label_contracts table
    await queryRunner.createTable(
      new Table({
        name: 'label_contracts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'contract_number',
            type: 'varchar',
          },
          {
            name: 'start_date',
            type: 'date',
          },
          {
            name: 'end_date',
            type: 'date',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'expired', 'terminated', 'pending'],
            default: "'pending'",
          },
          {
            name: 'royalty_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'advance_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'recouped_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'terms',
            type: 'jsonb',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'contract_document',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'label_id',
            type: 'uuid',
          },
          {
            name: 'artist_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create royalty_payments table
    await queryRunner.createTable(
      new Table({
        name: 'royalty_payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'gross_revenue',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'royalty_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'period_start',
            type: 'date',
          },
          {
            name: 'period_end',
            type: 'date',
          },
          {
            name: 'payment_date',
            type: 'date',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'paid', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'breakdown',
            type: 'jsonb',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'payment_reference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'contract_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create release_campaigns table
    await queryRunner.createTable(
      new Table({
        name: 'release_campaigns',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'release_date',
            type: 'date',
          },
          {
            name: 'announcement_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['planning', 'active', 'completed', 'cancelled'],
            default: "'planning'",
          },
          {
            name: 'budget',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'spent_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'strategy',
            type: 'jsonb',
          },
          {
            name: 'assets',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metrics',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'label_id',
            type: 'uuid',
          },
          {
            name: 'artist_id',
            type: 'uuid',
          },
          {
            name: 'album_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create campaign_tasks table
    await queryRunner.createTable(
      new Table({
        name: 'campaign_tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['todo', 'in_progress', 'completed', 'cancelled'],
            default: "'todo'",
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'urgent'],
            default: "'medium'",
          },
          {
            name: 'due_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'completed_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'estimated_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'actual_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'campaign_id',
            type: 'uuid',
          },
          {
            name: 'assigned_to_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create label_branding table
    await queryRunner.createTable(
      new Table({
        name: 'label_branding',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['logo', 'color_palette', 'typography', 'template', 'asset'],
            default: "'asset'",
          },
          {
            name: 'config',
            type: 'jsonb',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'usage',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'label_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'labels',
      new ForeignKey({
        columnNames: ['owner_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'label_contracts',
      new ForeignKey({
        columnNames: ['label_id'],
        referencedTableName: 'labels',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'label_contracts',
      new ForeignKey({
        columnNames: ['artist_id'],
        referencedTableName: 'artists',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'royalty_payments',
      new ForeignKey({
        columnNames: ['contract_id'],
        referencedTableName: 'label_contracts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'release_campaigns',
      new ForeignKey({
        columnNames: ['label_id'],
        referencedTableName: 'labels',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'release_campaigns',
      new ForeignKey({
        columnNames: ['artist_id'],
        referencedTableName: 'artists',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'release_campaigns',
      new ForeignKey({
        columnNames: ['album_id'],
        referencedTableName: 'albums',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'campaign_tasks',
      new ForeignKey({
        columnNames: ['campaign_id'],
        referencedTableName: 'release_campaigns',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'campaign_tasks',
      new ForeignKey({
        columnNames: ['assigned_to_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'label_branding',
      new ForeignKey({
        columnNames: ['label_id'],
        referencedTableName: 'labels',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('label_branding');
    await queryRunner.dropTable('campaign_tasks');
    await queryRunner.dropTable('release_campaigns');
    await queryRunner.dropTable('royalty_payments');
    await queryRunner.dropTable('label_contracts');
    await queryRunner.dropTable('labels');
  }
}