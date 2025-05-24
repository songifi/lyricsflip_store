import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as AWS from "aws-sdk"
import { v4 as uuidv4 } from "uuid"
import  { Express } from "express"

interface UploadResult {
  url: string
  key: string
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name)
  private readonly s3: AWS.S3
  private readonly bucketName: string

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get("AWS_REGION"),
    })
    const bucket = this.configService.get<string>("AWS_S3_BUCKET_NAME")
    if (!bucket) {
      throw new Error("AWS_S3_BUCKET_NAME is not defined in environment variables")
    }
    this.bucketName = bucket
  }

  async uploadAudio(file: Express.Multer.File, folder = "audio"): Promise<UploadResult> {
    const key = `${folder}/${uuidv4()}_${file.originalname}`

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "private", // Audio files should be private
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    }

    try {
      const result = await this.s3.upload(uploadParams).promise()

      this.logger.log(`Audio file uploaded successfully: ${key}`)

      return {
        url: result.Location,
        key: result.Key,
      }
    } catch (error) {
      this.logger.error(`Failed to upload audio file: ${error.message}`, error.stack)
      throw error
    }
  }

  async uploadFile(file: Express.Multer.File, folder = "files"): Promise<UploadResult> {
    const key = `${folder}/${uuidv4()}_${file.originalname}`

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    }

    try {
      const result = await this.s3.upload(uploadParams).promise()

      this.logger.log(`File uploaded successfully: ${key}`)

      return {
        url: result.Location,
        key: result.Key,
      }
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack)
      throw error
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    const downloadParams = {
      Bucket: this.bucketName,
      Key: key,
    }

    try {
      const result = await this.s3.getObject(downloadParams).promise()
      return result.Body as Buffer
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`, error.stack)
      throw error
    }
  }

  async deleteFile(key: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key,
    }

    try {
      await this.s3.deleteObject(deleteParams).promise()
      this.logger.log(`File deleted successfully: ${key}`)
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack)
      throw error
    }
  }

  async generateSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn,
    }

    try {
      return this.s3.getSignedUrl("getObject", params)
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`, error.stack)
      throw error
    }
  }
}
