// src/services/digital-download.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { DigitalDownload, DownloadStatus } from '../entities/digital-download.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class DigitalDownloadService {
  private readonly logger = new Logger(DigitalDownloadService.name);

  constructor(
    @InjectRepository(DigitalDownload)
    private digitalDownloadRepository: Repository<DigitalDownload>,
    private configService: ConfigService,
  ) {}

  async createDownload(
    purchaseItem: PurchaseItem,
    userId: string,
    queryRunner?: QueryRunner,
  ): Promise<DigitalDownload> {
    const manager = queryRunner ? queryRunner.manager : this.digitalDownloadRepository.manager;

    // Generate secure download token
    const downloadToken = this.generateSecureToken();
    
    // Set expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Get file information from the item
    const fileInfo = await this.getFileInfo(purchaseItem.itemId, purchaseItem.itemType);

    const download = manager.create(DigitalDownload, {
      purchaseItemId: purchaseItem.id,
      userId,
      fileName: fileInfo.fileName,
      filePath: fileInfo.filePath,
      secureUrl: this.generateSecureUrl(downloadToken),
      fileFormat: fileInfo.format,
      bitrate: fileInfo.bitrate,
      fileSize: fileInfo.size,
      fileHash: fileInfo.hash,
      downloadToken,
      expiresAt,
      status: DownloadStatus.READY,
      maxDownloads: 5,
      metadata: fileInfo.metadata,
    });

    const savedDownload = await manager.save(download);

    this.logger.log(`Digital download created: ${savedDownload.id} for user: ${userId}`);

    return savedDownload;
  }

  async getDownloadById(id: string, userId: string): Promise<DigitalDownload> {
    const download = await this.digitalDownloadRepository.findOne({
      where: { id },
      relations: ['purchaseItem', 'user'],
    });

    if (!download) {
      throw new NotFoundException('Download not found');
    }

    if (download.userId !== userId) {
      throw new ForbiddenException('Access denied to this download');
    }

    return download;
  }

  async getDownloadByToken(token: string): Promise<DigitalDownload> {
    const download = await this.digitalDownloadRepository.findOne({
      where: { downloadToken: token },
      relations: ['purchaseItem', 'user'],
    });

    if (!download) {
      throw new NotFoundException('Invalid download token');
    }

    if (download.status === DownloadStatus.EXPIRED) {
      throw new BadRequestException('Download has expired');
    }

    if (new Date() > download.expiresAt) {
      download.status = DownloadStatus.EXPIRED;
      await this.digitalDownloadRepository.save(download);
      throw new BadRequestException('Download has expired');
    }

    if (download.downloadCount >= download.maxDownloads) {
      throw new BadRequestException('Maximum download limit reached');
    }

    return download;
  }

  async processDownload(
    token: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const download = await this.getDownloadByToken(token);

    // Update download log
    const downloadLogEntry = {
      timestamp: new Date(),
      ipAddress,
      userAgent,
    };

    download.downloadCount += 1;
    download.downloadLog = download.downloadLog || [];
    download.downloadLog.push(downloadLogEntry);
    download.lastDownloadAt = new Date();

    if (!download.firstDownloadAt) {
      download.firstDownloadAt = new Date();
    }

    if (download.downloadCount >= download.maxDownloads) {
      download.status = DownloadStatus.DOWNLOADED;
    }

    await this.digitalDownloadRepository.save(download);

    // Verify file integrity
    await this.verifyFileIntegrity(download);

    this.logger.log(`Download processed: ${download.id}, count: ${download.downloadCount}`);

    return {
      filePath: download.filePath,
      fileName: download.fileName,
      mimeType: this.getMimeType(download.fileFormat),
    };
  }

  async getUserDownloads(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    downloads: DigitalDownload[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [downloads, total] = await this.digitalDownloadRepository.findAndCount({
      where: { userId },
      relations: ['purchaseItem'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      downloads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async refreshDownloadToken(downloadId: string, userId: string): Promise<DigitalDownload> {
    const download = await this.getDownloadById(downloadId, userId);

    if (download.status === DownloadStatus.EXPIRED) {
      throw new BadRequestException('Cannot refresh expired download');
    }

    // Generate new token and extend expiration
    download.downloadToken = this.generateSecureToken();
    download.secureUrl = this.generateSecureUrl(download.downloadToken);
    
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 days extension
    download.expiresAt = newExpiresAt;

    return this.digitalDownloadRepository.save(download);
  }

  async disableDownloadsForPurchase(purchaseId: string): Promise<void> {
    await this.digitalDownloadRepository
      .createQueryBuilder()
      .update(DigitalDownload)
      .set({ status: DownloadStatus.EXPIRED })
      .where('purchaseItemId IN (SELECT id FROM purchase_items WHERE purchase_id = :purchaseId)', {
        purchaseId,
      })
      .execute();

    this.logger.log(`Disabled downloads for purchase: ${purchaseId}`);
  }

  async transferDownloadsToRecipient(
    purchaseId: string,
    recipientId: string,
  ): Promise<void> {
    await this.digitalDownloadRepository
      .createQueryBuilder()
      .update(DigitalDownload)
      .set({ userId: recipientId })
      .where('purchaseItemId IN (SELECT id FROM purchase_items WHERE purchase_id = :purchaseId)', {
        purchaseId,
      })
      .execute();

    this.logger.log(`Transferred downloads to recipient: ${recipientId} for purchase: ${purchaseId}`);
  }

  async cleanupExpiredDownloads(): Promise<void> {
    const expiredDownloads = await this.digitalDownloadRepository
      .createQueryBuilder('download')
      .where('download.expiresAt < :now', { now: new Date() })
      .andWhere('download.status != :expired', { expired: DownloadStatus.EXPIRED })
      .getMany();

    for (const download of expiredDownloads) {
      download.status = DownloadStatus.EXPIRED;
      await this.digitalDownloadRepository.save(download);
    }

    this.logger.log(`Cleaned up ${expiredDownloads.length} expired downloads`);
  }

  private async getFileInfo(itemId: string, itemType: string): Promise<{
    fileName: string;
    filePath: string;
    format: string;
    bitrate?: string;
    size: number;
    hash: string;
    metadata: any;
  }> {
    // This would typically fetch from your music/content management system
    // For now, returning mock data structure
    const basePath = this.configService.get<string>('DOWNLOAD_BASE_PATH', '/downloads');
    
    // In a real implementation, you'd query your music database
    const mockFileInfo = {
      fileName: `${itemId}.mp3`,
      filePath: path.join(basePath, `${itemId}.mp3`),
      format: 'MP3',
      bitrate: '320kbps',
      size: 5242880, // 5MB
      hash: await this.calculateFileHash(path.join(basePath, `${itemId}.mp3`)),
      metadata: {
        title: 'Sample Track',
        artist: 'Sample Artist',
        album: 'Sample Album',
        duration: 240, // 4 minutes
        genre: 'Pop',
      },
    };

    return mockFileInfo;
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      this.logger.warn(`Could not calculate hash for ${filePath}: ${error.message}`);
      return crypto.randomBytes(32).toString('hex'); // Fallback
    }
  }

  private async verifyFileIntegrity(download: DigitalDownload): Promise<void> {
    try {
      const currentHash = await this.calculateFileHash(download.filePath);
      if (currentHash !== download.fileHash) {
        this.logger.error(`File integrity check failed for download: ${download.id}`);
        throw new BadRequestException('File integrity check failed');
      }
    } catch (error) {
      this.logger.error(`File integrity verification failed: ${error.message}`);
      throw new BadRequestException('File verification failed');
    }
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSecureUrl(token: string): string {
    const baseUrl = this.configService.get<string>('APP_BASE_URL', 'http://localhost:3000');
    return `${baseUrl}/api/downloads/secure/${token}`;
  }

  private getMimeType(format: string): string {
    const mimeTypes = {
      'MP3': 'audio/mpeg',
      'FLAC': 'audio/flac',
      'WAV': 'audio/wav',
      'AAC': 'audio/aac',
      'OGG': 'audio/ogg',
    };

    return mimeTypes[format.toUpperCase()] || 'application/octet-stream';
  }
}