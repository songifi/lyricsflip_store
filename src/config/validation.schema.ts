import * as Joi from "joi"

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default("api/v1"),

  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default("7d"),

  // AWS
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().default("us-east-1"),

  // AWS S3
  AWS_S3_BUCKET_NAME: Joi.string().required(),
  AWS_S3_ENDPOINT: Joi.string().optional(),
  AWS_S3_FORCE_PATH_STYLE: Joi.boolean().default(false),
  AWS_S3_SIGNATURE_VERSION: Joi.string().default("v4"),
  AWS_S3_MAX_FILE_SIZE: Joi.number().default(104857600), // 100MB
  AWS_S3_ALLOWED_MIME_TYPES: Joi.string().optional(),
  AWS_S3_URL_EXPIRATION: Joi.number().default(3600),

  // CloudFront (Optional)
  AWS_CLOUDFRONT_DOMAIN: Joi.string().optional(),
  AWS_CLOUDFRONT_PRIVATE_KEY_ID: Joi.string().optional(),
  AWS_CLOUDFRONT_PRIVATE_KEY: Joi.string().optional(),

  // Audio Processing
  FFMPEG_PATH: Joi.string().default("/usr/bin/ffmpeg"),
  AUDIO_PREVIEW_DURATION: Joi.number().default(30),
  AUDIO_WAVEFORM_POINTS: Joi.number().default(1000),

  // Redis (Optional)
  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),

  // Logging
  LOG_LEVEL: Joi.string().valid("error", "warn", "info", "debug").default("info"),
  LOG_FILE_PATH: Joi.string().optional(),
})
