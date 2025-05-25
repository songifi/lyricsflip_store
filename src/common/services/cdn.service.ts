import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import AWS from "aws-sdk"

export interface StreamingOptions {
  quality?: "low" | "medium" | "high" | "lossless"
  format?: "mp3" | "aac" | "flac"
  bitrate?: number
}

export interface CDNUploadResult {
  url: string
  cdnUrl: string
  key: string
  etag: string
}

@Injectable()
export class CDNService {
  private readonly logger = new Logger(CDNService.name)
  private readonly s3: AWS.S3
  private readonly cloudFront: AWS.CloudFront
  private readonly bucketName: string
  private readonly cdnDomain: string

  constructor(private configService: ConfigService) {
    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get("AWS_REGION", "us-east-1"),
    })

    this.s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      params: { Bucket: this.configService.get("AWS_S3_BUCKET") },
    })

    this.cloudFront = new AWS.CloudFront({
      apiVersion: "2020-05-31",
    })

    this.bucketName = this.configService.get("AWS_S3_BUCKET")
    this.cdnDomain = this.configService.get("CDN_DOMAIN")
  }

  async uploadAudioFile(file: Buffer, key: string, contentType = "audio/mpeg"): Promise<CDNUploadResult> {
    try {
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        CacheControl: "max-age=31536000", // 1 year cache
        Metadata: {
          "uploaded-at": new Date().toISOString(),
        },
      }

      const result = await this.s3.upload(uploadParams).promise()

      return {
        url: result.Location,
        cdnUrl: `https://${this.cdnDomain}/${key}`,
        key: result.Key,
        etag: result.ETag,
      }
    } catch (error) {
      this.logger.error(`Failed to upload audio file ${key}:`, error)
      throw error
    }
  }

  async generateStreamingUrl(trackId: string, options: StreamingOptions = {}): Promise<string> {
    try {
      const { quality = "medium", format = "mp3" } = options
      const key = `tracks/${trackId}/${quality}.${format}`

      // Generate signed URL for streaming
      const signedUrl = this.s3.getSignedUrl("getObject", {
        Bucket: this.bucketName,
        Key: key,
        Expires: 3600, // 1 hour
        ResponseContentType: `audio/${format}`,
        ResponseCacheControl: "max-age=3600",
      })

      return signedUrl
    } catch (error) {
      this.logger.error(`Failed to generate streaming URL for track ${trackId}:`, error)
      throw error
    }
  }

  async generateCDNStreamingUrl(trackId: string, options: StreamingOptions = {}): Promise<string> {
    const { quality = "medium", format = "mp3" } = options
    const key = `tracks/${trackId}/${quality}.${format}`

    return `https://${this.cdnDomain}/${key}`
  }

  async invalidateCDNCache(paths: string[]): Promise<void> {
    try {
      const distributionId = this.configService.get("CLOUDFRONT_DISTRIBUTION_ID")

      const invalidationParams = {
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: `invalidation-${Date.now()}`,
          Paths: {
            Quantity: paths.length,
            Items: paths.map((path) => `/${path}`),
          },
        },
      }

      await this.cloudFront.createInvalidation(invalidationParams).promise()
      this.logger.log(`CDN cache invalidated for paths: ${paths.join(", ")}`)
    } catch (error) {
      this.logger.error("Failed to invalidate CDN cache:", error)
      throw error
    }
  }

  async getStreamingMetrics(trackId: string): Promise<any> {
    try {
      // Get CloudWatch metrics for streaming
      const cloudWatch = new AWS.CloudWatch()

      const params = {
        MetricName: "BytesDownloaded",
        Namespace: "AWS/CloudFront",
        StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        EndTime: new Date(),
        Period: 3600, // 1 hour intervals
        Statistics: ["Sum", "Average"],
        Dimensions: [
          {
            Name: "DistributionId",
            Value: this.configService.get("CLOUDFRONT_DISTRIBUTION_ID"),
          },
        ],
      }

      const metrics = await cloudWatch.getMetricStatistics(params).promise()
      return metrics
    } catch (error) {
      this.logger.error(`Failed to get streaming metrics for track ${trackId}:`, error)
      return null
    }
  }
}
