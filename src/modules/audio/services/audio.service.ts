// src/audio/services/audio.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AudioFile } from '../entities/audio-file.entity';
import { Repository } from 'typeorm';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as mm from 'music-metadata';
import * as crypto from 'crypto';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private readonly storagePath = path.join(__dirname, '..', '..', '..', 'storage');

  constructor(
    @InjectRepository(AudioFile)
    private audioRepo: Repository<AudioFile>,
  ) {}

  async handleUpload(file: Express.Multer.File) {
    const storedName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.storagePath, storedName);
    fs.writeFileSync(filePath, file.buffer);

    const entity = this.audioRepo.create({
      originalName: file.originalname,
      storedName,
      mimeType: file.mimetype,
      status: 'processing',
    });
    const saved = await this.audioRepo.save(entity);

    try {
      // Extract Metadata
      const metadata = await mm.parseBuffer(file.buffer);
      saved.metadata = metadata;
      saved.duration = metadata.format.duration;

      // Convert to multiple formats
      await this.convertFormats(filePath, storedName);

      // Analyze Quality
      saved.qualityMetrics = await this.analyzeQuality(filePath);

      // Generate waveform
      saved.waveformPath = await this.generateWaveform(filePath);

      // Fingerprint
      saved.fingerprintHash = this.generateFingerprint(file.buffer);

      // Normalize
      saved.gainLevel = await this.normalizeGain(filePath);

      saved.status = 'completed';
      return await this.audioRepo.save(saved);
    } catch (err) {
      this.logger.error(err);
      saved.status = 'failed';
      await this.audioRepo.save(saved);
      throw err;
    }
  }

  private convertFormats(originalPath: string, baseName: string): Promise<void> {
    const formats = ['mp3', 'aac', 'ogg'];
    return Promise.all(
      formats.map(
        (format) =>
          new Promise<void>((resolve, reject) => {
            ffmpeg(originalPath)
              .toFormat(format)
              .save(`${this.storagePath}/${baseName}.${format}`)
              .on('end', resolve)
              .on('error', reject);
          }),
      ),
    ).then(() => {});
  }

  private async analyzeQuality(filePath: string) {
    // Placeholder: Add SNR, dynamic range, etc.
    return {
      bitrate: 320,
      clarity: 'high',
    };
  }

  private async generateWaveform(filePath: string): Promise<string> {
    const waveformPath = `${filePath}.waveform.png`;
    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .complexFilter(['aformat=channel_layouts=mono', 'showwavespic=s=640x120'])
        .frames(1)
        .save(waveformPath)
        .on('end', () => resolve(waveformPath))
        .on('error', reject);
    });
  }

  private generateFingerprint(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private normalizeGain(filePath: string): Promise<number> {
    // Placeholder: real gain normalization
    return Promise.resolve(1.0); // unity gain
  }
}
