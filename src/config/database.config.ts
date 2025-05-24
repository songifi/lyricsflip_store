import { registerAs } from '@nestjs/config';
import awsConfig from './aws.config';

const appConfig = () => ({
  port: Number.parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  audio: {
    ffmpegPath: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
    previewDuration: Number.parseInt(process.env.AUDIO_PREVIEW_DURATION || '30', 10),
    waveformPoints: Number.parseInt(process.env.AUDIO_WAVEFORM_POINTS || '1000', 10),
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH,
  },

  aws: awsConfig,
});

const databaseConfig = registerAs('database', () => ({
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
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '100', 10),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000', 10),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));

export default appConfig;
export { databaseConfig };
