# Database Setup Guide

This document outlines the database setup for the music and merchandise platform.

## Prerequisites

- PostgreSQL 13+ installed
- Node.js 16+ installed
- NestJS CLI installed

## Environment Configuration

1. Create environment-specific `.env` files in the `src/config` directory:
   - `.env.development`
   - `.env.test`
   - `.env.production`

2. Configure the following variables in each file:
   \`\`\`
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=music_platform
   NODE_ENV=development
   DATABASE_POOL_SIZE=10
   DATABASE_MAX_CONNECTIONS=100
   DATABASE_CONNECTION_TIMEOUT=10000
   \`\`\`

## Running Migrations

To generate a new migration:
\`\`\`bash
npm run migration:generate -- src/database/migrations/MigrationName
\`\`\`

To run migrations:
\`\`\`bash
npm run migration:run
\`\`\`

To revert the last migration:
\`\`\`bash
npm run migration:revert
\`\`\`

## Connection Pooling

The application is configured with connection pooling optimized for music streaming workloads:

- Default pool size: 10 connections
- Maximum connections: 100
- Connection timeout: 10 seconds

These values can be adjusted in the environment variables.

## Entity Validation

All entities are validated using class-validator. To add a new entity:

1. Extend the BaseEntity class
2. Add appropriate TypeORM decorators
3. Add class-validator decorators for validation

Example:
\`\`\`typescript
@Entity('your_table')
export class YourEntity extends BaseEntity {
  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;
}
\`\`\`

## Development Workflow

1. Create or modify entities
2. Generate migrations
3. Run migrations
4. Implement business logic

## Production Considerations

- In production, migrations are not automatically run
- Synchronize is disabled in production for data safety
- SSL is enabled for secure connections
\`\`\`

## How to Use This Implementation

1. Copy these files to your project structure
2. Create the appropriate `.env` files in the `src/config` directory
3. Run `npm install` to install dependencies
4. Run `npm run migration:run` to apply the initial schema
5. Import the `DatabaseModule` in your `AppModule`

This implementation provides:
- Environment-specific database configurations
- TypeORM integration with NestJS
- Migration system for schema changes
- Entity validation with class-validator
- Connection pooling optimized for music streaming
- Comprehensive documentation

