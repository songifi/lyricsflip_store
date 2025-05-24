import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateStreamingTables1703001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create streaming_sessions table
    await queryRunner.createTable(
      new Table({
        name: 'streaming_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'trackId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'quality',
            type: 'enum',
            enum: ['128k', '320k', 'lossless'],
            default: "'320k'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['playing', 'paused', 'stopped', 'buffering'],
            default: "'playing'",
          },
          {
            name: 'startTime',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'endTime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'integer',
            default: 0,
          },
          {
            name: 'bytesStreamed',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
          },
          {
            name: 'userAgent',
            type: 'text',
          },
          {
            name: 'location',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
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
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['trackId'],
            referencedTableName: 'tracks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Create streaming_analytics table
    await queryRunner.createTable(
      new Table({
        name: 'streaming_analytics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'trackId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'playCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'totalDuration',
            type: 'integer',
            default: 0,
          },
          {
            name: 'completionRate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'skipRate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'averageListenTime',
            type: 'integer',
            default: 0,
          },
          {
            name: 'lastPlayedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'consecutivePlays',
            type: 'integer',
            default: 0,
          },
          {
            name: 'qualityPreferences',
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
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['trackId'],
            referencedTableName: 'tracks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Create download_sessions table
    await queryRunner.createTable(
      new Table({
        name: 'download_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'trackId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'quality',
            type: 'enum',
            enum: ['128k', '320k', 'lossless'],
            default: "'320k'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'downloading', 'completed', 'failed', 'expired'],
            default: "'pending'",
          },
          {
            name: 'fileSize',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'downloadedBytes',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'progress',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'startedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'filePath',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'licenseInfo',
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
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['trackId'],
            referencedTableName: 'tracks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Create streaming_history table
    await queryRunner.createTable(
      new Table({
        name: 'streaming_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'trackId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'playedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'quality',
            type: 'enum',
            enum: ['128k', '320k', 'lossless'],
            default: "'320k'",
          },
          {
            name: 'listenDuration',
            type: 'integer',
            default: 0,
          },
          {
            name: 'completionPercentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'skipped',
            type: 'boolean',
            default: false,
          },
          {
            name: 'context',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'contextId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
          },
          {
            name: 'userAgent',
            type: 'text',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['trackId'],
            referencedTableName: 'tracks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'streaming_sessions',
      new Index('IDX_streaming_sessions_user_created', ['userId', 'createdAt'])
    );

    await queryRunner.createIndex(
      'streaming_sessions',
      new Index('IDX_streaming_sessions_track_created', ['trackId', 'createdAt'])
    );

    await queryRunner.createIndex(
      'streaming_analytics',
      new Index('IDX_streaming_analytics_user_track', ['userId', 'trackId'], { isUnique: true })
    );

    await queryRunner.createIndex(
      'streaming_analytics',
      new Index('IDX_streaming_analytics_track_updated', ['trackId', 'updatedAt'])
    );

    await queryRunner.createIndex(
      'download_sessions',
      new Index('IDX_download_sessions_user_status', ['userId', 'status'])
    );

    await queryRunner.createIndex(
      'download_sessions',
      new Index('IDX_download_sessions_track_status', ['trackId', 'status'])
    );

    await queryRunner.createIndex(
      'streaming_history',
      new Index('IDX_streaming_history_user_played', ['userId', 'playedAt'])
    );

    await queryRunner.createIndex(
      'streaming_history',
      new Index('IDX_streaming_history_track_played', ['trackId', 'playedAt'])
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('streaming_history');
    await queryRunner.dropTable('download_sessions');
    await queryRunner.dropTable('streaming_analytics');
    await queryRunner.dropTable('streaming_sessions');
  }
}
