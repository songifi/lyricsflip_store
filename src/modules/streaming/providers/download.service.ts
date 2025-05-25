import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DownloadSession } from '../../../database/entities/download-session.entity';
import { CreateDownloadRequestDto, UpdateDownloadProgressDto } from '../dto/download-request.dto';
import { DownloadStatus, AudioQuality } from '../enums/audio-quality.enum';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DownloadService {
  private readonly downloadPath = process.env.DOWNLOAD_PATH || './downloads';
  private readonly maxDownloadsPerUser = 100;
  private readonly downloadExpiryDays = 30;

  constructor(
    private downloadRepository: Repository<DownloadSession>,
  ) {}

  async createDownloadRequest(
    userId: string,
    createDownloadDto: CreateDownloadRequestDto
  ): Promise<DownloadSession> {
    // Check user's download quota
    const activeDownloads = await this.downloadRepository.count({
      where: {
        userId,
        status: DownloadStatus.COMPLETED
      }
    });

    if (activeDownloads >= this.maxDownloadsPerUser) {
      throw new ForbiddenException('Download quota exceeded');
    }

    // Check if track is already downloaded
    const existingDownload = await this.downloadRepository.findOne({
      where: {
        userId,
        trackId: createDownloadDto.trackId,
        quality: createDownloadDto.quality,
        status: DownloadStatus.COMPLETED
      }
    });

    if (existingDownload && !this.isDownloadExpired(existingDownload)) {
      return existingDownload;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.downloadExpiryDays);

    const download = this.downloadRepository.create({
      userId,
      trackId: createDownloadDto.trackId,
      quality: createDownloadDto.quality || AudioQuality.HIGH,
      status: DownloadStatus.PENDING,
      expiresAt,
      licenseInfo: {
        offlineMode: createDownloadDto.offlineMode,
        downloadedAt: new Date(),
        expiresAt
      }
    });

    const savedDownload = await this.downloadRepository.save(download);
    
    // Start download process asynchronously
    this.processDownload(savedDownload.id);
    
    return savedDownload;
  }

  async updateDownloadProgress(updateDto: UpdateDownloadProgressDto): Promise<DownloadSession> {
    const download = await this.downloadRepository.findOne({
      where: { id: updateDto.downloadId }
    });

    if (!download) {
      throw new NotFoundException('Download session not found');
    }

    if (updateDto.downloadedBytes) {
      download.downloadedBytes = updateDto.downloadedBytes;
    }

    if (updateDto.progress) {
      download.progress = updateDto.progress;
    }

    if (updateDto.errorMessage) {
      download.errorMessage = updateDto.errorMessage;
      download.status = DownloadStatus.FAILED;
    }

    return this.downloadRepository.save(download);
  }

  async getUserDownloads(userId: string): Promise<DownloadSession[]> {
    return this.downloadRepository.find({
      where: { userId },
      relations: ['track'],
      order: { createdAt: 'DESC' }
    });
  }

  async getActiveDownloads(userId: string): Promise<DownloadSession[]> {
    return this.downloadRepository.find({
      where: {
        userId,
        status: DownloadStatus.DOWNLOADING
      },
      relations: ['track']
    });
  }

  async deleteDownload(userId: string, downloadId: string): Promise<void> {
    const download = await this.downloadRepository.findOne({
      where: { id: downloadId, userId }
    });

    if (!download) {
      throw new NotFoundException('Download not found');
    }

    // Delete file if exists
    if (download.filePath && fs.existsSync(download.filePath)) {
      fs.unlinkSync(download.filePath);
    }

    await this.downloadRepository.remove(download);
  }

  async cleanupExpiredDownloads(): Promise<void> {
    const expiredDownloads = await this.downloadRepository.find({
      where: {
        status: DownloadStatus.COMPLETED,
        expiresAt: new Date()
      }
    });

    for (const download of expiredDownloads) {
      if (download.filePath && fs.existsSync(download.filePath)) {
        fs.unlinkSync(download.filePath);
      }
      download.status = DownloadStatus.EXPIRED;
      await this.downloadRepository.save(download);
    }
  }

  private async processDownload(downloadId: string): Promise<void> {
    const download = await this.downloadRepository.findOne({
      where: { id: downloadId },
      relations: ['track']
    });

    if (!download) return;

    try {
      download.status = DownloadStatus.DOWNLOADING;
      download.startedAt = new Date();
      await this.downloadRepository.save(download);

      // Simulate file processing and download
      const fileName = `${download.track.id}_${download.quality}.${this.getFileExtension(download.quality)}`;
      const filePath = path.join(this.downloadPath, fileName);

      // Ensure download directory exists
      if (!fs.existsSync(this.downloadPath)) {
        fs.mkdirSync(this.downloadPath, { recursive: true });
      }

      // Here you would implement actual audio file processing and encoding
      // For now, we'll simulate the process
      await this.simulateDownloadProcess(download, filePath);

      download.status = DownloadStatus.COMPLETED;
      download.completedAt = new Date();
      download.filePath = filePath;
      download.progress = 100;

      await this.downloadRepository.save(download);
    } catch (error) {
      download.status = DownloadStatus.FAILED;
      download.errorMessage = error.message;
      await this.downloadRepository.save(download);
    }
  }

  private async simulateDownloadProcess(download: DownloadSession, filePath: string): Promise<void> {
    // Simulate file size based on quality
    const fileSizes = {
      [AudioQuality.LOW]: 3 * 1024 * 1024, // 3MB
      [AudioQuality.HIGH]: 8 * 1024 * 1024, // 8MB
      [AudioQuality.LOSSLESS]: 25 * 1024 * 1024 // 25MB
    };

    download.fileSize = fileSizes[download.quality];
    
    // Simulate progressive download
    for (let i = 0; i <= 100; i += 10) {
      download.downloadedBytes = Math.floor((download.fileSize * i) / 100);
      download.progress = i;
      await this.downloadRepository.save(download);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create a placeholder file
    fs.writeFileSync(filePath, `Placeholder audio file for track ${download.trackId}`);
  }

  private getFileExtension(quality: AudioQuality): string {
    switch (quality) {
      case AudioQuality.LOW:
      case AudioQuality.HIGH:
        return 'mp3';
      case AudioQuality.LOSSLESS:
        return 'flac';
      default:
        return 'mp3';
    }
  }

  private isDownloadExpired(download: DownloadSession): boolean {
    return download.expiresAt && download.expiresAt < new Date();
  }
}
