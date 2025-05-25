import { MigrationInterface, QueryRunner, Table, ForeignKey, Index } from 'typeorm';

export class CreateBandsTables1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create bands table
    await queryRunner.createTable(
      new Table({
        name: 'bands',
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
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'genre',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'profileImage',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bannerImage',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'socialLinks',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'disbanded'],
            default: "'active'",
          },
          {
            name: 'formedDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'founderId',
            type: 'uuid',
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
    );

    // Create band_members table
    await queryRunner.createTable(
      new Table({
        name: 'band_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'bandId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'permission',
            type: 'enum',
            enum: ['admin', 'manager', 'member', 'guest'],
            default: "'member'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'left', 'removed'],
            default: "'active'",
          },
          {
            name: 'joinedDate',
            type: 'date',
          },
          {
            name: 'leftDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
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
    );

    // Create band_roles table
    await queryRunner.createTable(
      new Table({
        name: 'band_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'memberId',
            type: 'uuid',
          },
          {
            name: 'instrument',
            type: 'enum',
            enum: [
              'vocals',
              'guitar',
              'bass',
              'drums',
              'keyboard',
              'piano',
              'violin',
              'saxophone',
              'trumpet',
              'flute',
              'harmonica',
              'dj',
              'producer',
              'songwriter',
              'manager',
              'other',
            ],
          },
          {
            name: 'customRole',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'isPrimary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create collaborations table
    await queryRunner.createTable(
      new Table({
        name: 'collaborations',
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
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['album', 'single', 'ep', 'live_performance', 'tour', 'other'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['planning', 'in_progress', 'completed', 'cancelled'],
            default: "'planning'",
          },
          {
            name: 'bandId',
            type: 'uuid',
          },
          {
            name: 'initiatorId',
            type: 'uuid',
          },
          {
            name: 'startDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'endDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'terms',
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
    );

    // Create collaboration_invites table
    await queryRunner.createTable(
      new Table({
        name: 'collaboration_invites',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'collaborationId',
            type: 'uuid',
          },
          {
            name: 'invitedUserId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'invitedBandId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'invitedById',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'accepted', 'declined', 'expired'],
            default: "'pending'",
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'proposedTerms',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'respondedAt',
            type: 'timestamp',
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
    );

    // Create revenue_shares table
    await queryRunner.createTable(
      new Table({
        name: 'revenue_shares',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'bandId',
            type: 'uuid',
          },
          {
            name: 'memberId',
            type: 'uuid',
          },
          {
            name: 'revenueType',
            type: 'enum',
            enum: ['streaming', 'merchandise', 'live_performance', 'licensing', 'sponsorship', 'other'],
          },
          {
            name: 'percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'pending'],
            default: "'active'",
          },
          {
            name: 'effectiveDate',
            type: 'date',
          },
          {
            name: 'endDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'conditions',
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
    );

    // Create band_messages table
    await queryRunner.createTable(
      new Table({
        name: 'band_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'bandId',
            type: 'uuid',
          },
          {
            name: 'senderId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['text', 'announcement', 'file', 'audio', 'image'],
            default: "'text'",
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'attachments',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isPinned',
            type: 'boolean',
            default: false,
          },
          {
            name: 'readBy',
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
    );

    // Create band_albums table
    await queryRunner.createTable(
      new Table({
        name: 'band_albums',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'bandId',
            type: 'uuid',
          },
          {
            name: 'albumId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['planning', 'recording', 'mixing', 'mastering', 'completed', 'released'],
            default: "'planning'",
          },
          {
            name: 'contributors',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'revenueDistribution',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'targetReleaseDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
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
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'bands',
      new ForeignKey({
        columnNames: ['founderId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'band_members',
      new ForeignKey({
        columnNames: ['bandId'],
        referencedTableName: 'bands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'band_members',
      new ForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'band_roles',
      new ForeignKey({
        columnNames: ['memberId'],
        referencedTableName: 'band_members',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collaborations',
      new ForeignKey({
        columnNames: ['bandId'],
        referencedTableName: 'bands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collaborations',
      new ForeignKey({
        columnNames: ['initiatorId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collaboration_invites',
      new ForeignKey({
        columnNames: ['collaborationId'],
        referencedTableName: 'collaborations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collaboration_invites',
      new ForeignKey({
        columnNames: ['invitedUserId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collaboration_invites',
      new ForeignKey({
        columnNames: ['invitedBandId'],
        referencedTableName: 'bands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collaboration_invites',
      new ForeignKey({
        columnNames: ['invitedById'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'revenue_shares',
      new ForeignKey({
        columnNames: ['bandId'],
        referencedTableName: 'bands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'revenue_shares',
      new ForeignKey({
        columnNames: ['memberId'],
        referencedTableName: 'band_members',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'band_messages',
      new ForeignKey({
        columnNames: ['bandId'],
        referencedTableName: 'bands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'band_messages',
      new ForeignKey({
        columnNames: ['senderId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'band_albums',
      new ForeignKey({
        columnNames: ['bandId'],
        referencedTableName: 'bands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes for better performance
    await queryRunner.createIndex(
      'bands',
      new Index('IDX_bands_founder', ['founderId']),
    );

    await queryRunner.createIndex(
      'band_members',
      new Index('IDX_band_members_band_user', ['bandId', 'userId']),
    );

    await queryRunner.createIndex(
      'band_members',
      new Index('IDX_band_members_status', ['status']),
    );

    await queryRunner.createIndex(
      'collaborations',
      new Index('IDX_collaborations_band', ['bandId']),
    );

    await queryRunner.createIndex(
      'collaboration_invites',
      new Index('IDX_collaboration_invites_user', ['invitedUserId']),
    );

    await queryRunner.createIndex(
      'collaboration_invites',
      new Index('IDX_collaboration_invites_band', ['invitedBandId']),
    );

    await queryRunner.createIndex(
      'revenue_shares',
      new Index('IDX_revenue_shares_band_type', ['bandId', 'revenueType']),
    );

    await queryRunner.createIndex(
      'band_messages',
      new Index('IDX_band_messages_band_created', ['bandId', 'createdAt']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('band_albums');
    await queryRunner.dropTable('band_messages');
    await queryRunner.dropTable('revenue_shares');
    await queryRunner.dropTable('collaboration_invites');
    await queryRunner.dropTable('collaborations');
    await queryRunner.dropTable('band_roles');
    await queryRunner.dropTable('band_members');
    await queryRunner.dropTable('bands');
  }
}