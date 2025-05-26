import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateRightsTables1700000001 implements MigrationInterface {
  name = 'CreateRightsTables1700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create rights table
    await queryRunner.createTable(
      new Table({
        name: 'rights',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'rightsType',
            type: 'enum',
            enum: ['master', 'publishing', 'mechanical', 'performance', 'synchronization', 'digital', 'neighboring'],
          },
          {
            name: 'ownershipType',
            type: 'enum',
            enum: ['full', 'partial', 'exclusive', 'non_exclusive'],
          },
          {
            name: 'ownershipPercentage',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: 1.0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'pending', 'expired', 'disputed', 'transferred'],
            default: "'active'",
          },
          {
            name: 'ownerId',
            type: 'uuid',
          },
          {
            name: 'trackId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'albumId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'effectiveDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'expirationDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'territory',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'restrictions',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'registrationNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isrcCode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'iswcCode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create copyright_registrations table
    await queryRunner.createTable(
      new Table({
        name: 'copyright_registrations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'registrationNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'registrationType',
            type: 'enum',
            enum: ['sound_recording', 'musical_work', 'both'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'submitted', 'approved', 'rejected', 'expired'],
            default: "'pending'",
          },
          {
            name: 'applicantId',
            type: 'uuid',
          },
          {
            name: 'trackId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'albumId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'workTitle',
            type: 'varchar',
          },
          {
            name: 'workDescription',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'creationDate',
            type: 'date',
          },
          {
            name: 'publicationDate',
            type: 'date',
          },
          {
            name: 'registrationDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'authors',
            type: 'jsonb',
          },
          {
            name: 'claimants',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'previousRegistrations',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'depositCopy',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'filingFee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'rejectionReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create rights_transfers table
    await queryRunner.createTable(
      new Table({
        name: 'rights_transfers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'rightsId',
            type: 'uuid',
          },
          {
            name: 'transferorId',
            type: 'uuid',
          },
          {
            name: 'transfereeId',
            type: 'uuid',
          },
          {
            name: 'transferType',
            type: 'enum',
            enum: ['assignment', 'license', 'sublicense', 'reversion'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'executed', 'cancelled', 'disputed'],
            default: "'pending'",
          },
          {
            name: 'transferPercentage',
            type: 'decimal',
            precision: 5,
            scale: 4,
          },
          {
            name: 'transferDate',
            type: 'date',
          },
          {
            name: 'effectiveDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'expirationDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'considerationAmount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'considerationCurrency',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'terms',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'conditions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'contractReference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'documents',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create rights_conflicts table
    await queryRunner.createTable(
      new Table({
        name: 'rights_conflicts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'rightsId',
            type: 'uuid',
          },
          {
            name: 'conflictType',
            type: 'enum',
            enum: ['ownership_dispute', 'percentage_mismatch', 'overlapping_claims', 'expired_rights', 'invalid_transfer', 'territory_conflict'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['open', 'investigating', 'resolved', 'escalated'],
            default: "'open'",
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical'],
            default: "'medium'",
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'reportedById',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'assignedToId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'conflictingRights',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'resolution',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'resolvedAt',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'evidence',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create collection_society_reports table
    await queryRunner.createTable(
      new Table({
        name: 'collection_society_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'reportType',
            type: 'enum',
            enum: ['performance', 'mechanical', 'digital', 'synchronization', 'neighboring'],
          },
          {
            name: 'society',
            type: 'enum',
            enum: ['ascap', 'bmi', 'sesac', 'prs', 'gema', 'sacem', 'jasrac', 'socan'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'submitted', 'processing', 'approved', 'rejected'],
            default: "'draft'",
          },
          {
            name: 'submittedById',
            type: 'uuid',
          },
          {
            name: 'reportingPeriodStart',
            type: 'date',
          },
          {
            name: 'reportingPeriodEnd',
            type: 'date',
          },
          {
            name: 'reportingPeriod',
            type: 'varchar',
          },
          {
            name: 'reportData',
            type: 'jsonb',
          },
          {
            name: 'submissionReference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'submissionDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'rejectionReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'attachments',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('rights', new Index('IDX_rights_track_type', ['trackId', 'rightsType']));
    await queryRunner.createIndex('rights', new Index('IDX_rights_owner_type', ['ownerId', 'rightsType']));
    await queryRunner.createIndex('rights', new Index('IDX_rights_status', ['status']));

    await queryRunner.createIndex('copyright_registrations', new Index('IDX_copyright_registration_number', ['registrationNumber']));
    await queryRunner.createIndex('copyright_registrations', new Index('IDX_copyright_status', ['status']));

    await queryRunner.createIndex('rights_transfers', new Index('IDX_transfer_date', ['transferDate']));
    await queryRunner.createIndex('rights_transfers', new Index('IDX_transfer_status', ['status']));

    await queryRunner.createIndex('rights_conflicts', new Index('IDX_conflict_type', ['conflictType']));
    await queryRunner.createIndex('rights_conflicts', new Index('IDX_conflict_status', ['status']));
    await queryRunner.createIndex('rights_conflicts', new Index('IDX_conflict_severity', ['severity']));

    await queryRunner.createIndex('collection_society_reports', new Index('IDX_report_type', ['reportType']));
    await queryRunner.createIndex('collection_society_reports', new Index('IDX_report_status', ['status']));
    await queryRunner.createIndex('collection_society_reports', new Index('IDX_report_society', ['society']));
    await queryRunner.createIndex('collection_society_reports', new Index('IDX_report_period', ['reportingPeriod']));

    // Create foreign keys (assuming users, tracks, and albums tables exist)
    await queryRunner.createForeignKey('rights', new ForeignKey({
      columnNames: ['ownerId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('rights', new ForeignKey({
      columnNames: ['trackId'],
      referencedTableName: 'tracks',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('rights', new ForeignKey({
      columnNames: ['albumId'],
      referencedTableName: 'albums',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('copyright_registrations', new ForeignKey({
      columnNames: ['applicantId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('copyright_registrations', new ForeignKey({
      columnNames: ['trackId'],
      referencedTableName: 'tracks',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('copyright_registrations', new ForeignKey({
      columnNames: ['albumId'],
      referencedTableName: 'albums',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('rights_transfers', new ForeignKey({
      columnNames: ['rightsId'],
      referencedTableName: 'rights',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('rights_transfers', new ForeignKey({
      columnNames: ['transferorId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('rights_transfers', new ForeignKey({
      columnNames: ['transfereeId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('rights_conflicts', new ForeignKey({
      columnNames: ['rightsId'],
      referencedTableName: 'rights',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('rights_conflicts', new ForeignKey({
      columnNames: ['reportedById'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    await queryRunner.createForeignKey('rights_conflicts', new ForeignKey({
      columnNames: ['assignedToId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    await queryRunner.createForeignKey('collection_society_reports', new ForeignKey({
      columnNames: ['submittedById'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('collection_society_reports');
    await queryRunner.dropTable('rights_conflicts');
    await queryRunner.dropTable('rights_transfers');
    await queryRunner.dropTable('copyright_registrations');
    await queryRunner.dropTable('rights');
  }
}