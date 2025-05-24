import { registerAs } from "@nestjs/config"

export default registerAs("aws", () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
  s3: {
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    endpoint: process.env.AWS_S3_ENDPOINT,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
    signatureVersion: process.env.AWS_S3_SIGNATURE_VERSION || "v4",
    maxFileSize: Number.parseInt(process.env.AWS_S3_MAX_FILE_SIZE || "") || 100 * 1024 * 1024, 
    allowedMimeTypes: process.env.AWS_S3_ALLOWED_MIME_TYPES?.split(",") || [
      "audio/mpeg",
      "audio/wav",
      "audio/flac",
      "audio/aac",
      "audio/ogg",
      "audio/mp4",
      "audio/x-wav",
      "audio/x-flac",
    ],
    urlExpirationTime: Number.parseInt(process.env.AWS_S3_URL_EXPIRATION || "") || 3600, 
  },
  cloudFront: {
    distributionDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
    privateKeyId: process.env.AWS_CLOUDFRONT_PRIVATE_KEY_ID,
    privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
  },
}))
