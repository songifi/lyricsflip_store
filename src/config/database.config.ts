import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Ensure required environment variables have default values
  const config = {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'lyricsflip_store',
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun: process.env.NODE_ENV !== 'production',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    // Connection pooling configuration
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '100', 10),
    connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000', 10),
    // SSL configuration for production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };

  return config;
});