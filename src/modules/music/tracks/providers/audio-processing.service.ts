import { Injectable, Logger } from "@nestjs/common"
import * as ffmpeg from "fluent-ffmpeg"
import * as crypto from "crypto"
import { AudioFormat } from "../enums/audioFormat.enum"

interface AudioMetadata {
  duration: number
  bitrate: number
  sampleRate: number
  format: AudioFormat
  channels: number
}

@Injectable()
export class AudioProcessingService {
  private readonly logger = new Logger(AudioProcessingService.name)

  async extractMetadata(audioBuffer: Buffer): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
      const tempPath = `/tmp/${Date.now()}_temp_audio`

      // Write buffer to temporary file
      require("fs").writeFileSync(tempPath, audioBuffer)

      ffmpeg(tempPath).ffprobe((err, metadata) => {
        // Clean up temp file
        require("fs").unlinkSync(tempPath)

        if (err) {
          this.logger.error(`Failed to extract metadata: ${err.message}`)
          reject(err)
          return
        }

        const audioStream = metadata.streams.find((stream) => stream.codec_type === "audio")

        if (!audioStream) {
          reject(new Error("No audio stream found"))
          return
        }

        resolve({
          duration: Math.round(metadata.format.duration || 0),
          bitrate: Math.round((metadata.format.bit_rate || 0) / 1000),
          sampleRate: audioStream.sample_rate || 44100,
          format: this.getAudioFormat(metadata.format.format_name || ""),
          channels: audioStream.channels || 2,
        })
      })
    })
  }

  async generatePreview(audioBuffer: Buffer, durationSeconds = 30): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const inputPath = `/tmp/${Date.now()}_input_audio`
      const outputPath = `/tmp/${Date.now()}_preview.mp3`

      // Write input buffer to temporary file
      require("fs").writeFileSync(inputPath, audioBuffer)

      // Get audio duration first
      ffmpeg(inputPath).ffprobe((err, metadata) => {
        if (err) {
          require("fs").unlinkSync(inputPath)
          reject(err)
          return
        }

        const totalDuration = metadata.format.duration || 0
        const startTime = Math.max(0, (totalDuration - durationSeconds) / 2)

        ffmpeg(inputPath)
          .seekInput(startTime)
          .duration(durationSeconds)
          .audioCodec("libmp3lame")
          .audioBitrate(128)
          .format("mp3")
          .output(outputPath)
          .on("end", () => {
            try {
              const previewBuffer = require("fs").readFileSync(outputPath)

              // Clean up temp files
              require("fs").unlinkSync(inputPath)
              require("fs").unlinkSync(outputPath)

              resolve(previewBuffer)
            } catch (readError) {
              reject(readError)
            }
          })
          .on("error", (ffmpegError) => {
            // Clean up temp files
            require("fs").unlinkSync(inputPath)
            if (require("fs").existsSync(outputPath)) {
              require("fs").unlinkSync(outputPath)
            }
            reject(ffmpegError)
          })
          .run()
      })
    })
  }

  async generateWaveform(audioBuffer: Buffer): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const inputPath = `/tmp/${Date.now()}_input_audio`
      const outputPath = `/tmp/${Date.now()}_waveform.json`

      // Write input buffer to temporary file
      require("fs").writeFileSync(inputPath, audioBuffer)

      ffmpeg(inputPath)
        .audioFilters("aresample=8000")
        .format("f64le")
        .output("pipe:1")
        .on("end", () => {
          // Clean up temp file
          require("fs").unlinkSync(inputPath)
        })
        .on("error", (err) => {
          require("fs").unlinkSync(inputPath)
          reject(err)
        })
        .pipe()
        .on("data", (chunk: Buffer) => {
          // Process audio data to generate waveform points
          const samples: number[] = []
          for (let i = 0; i < chunk.length; i += 8) {
            if (i + 8 <= chunk.length) {
              const sample = chunk.readDoubleLE(i)
              samples.push(Math.abs(sample))
            }
          }

          // Downsample to ~1000 points for visualization
          const targetPoints = 1000
          const step = Math.max(1, Math.floor(samples.length / targetPoints))
          const waveform: number[] = []

          for (let i = 0; i < samples.length; i += step) {
            const chunk = samples.slice(i, i + step)
            const max = Math.max(...chunk)
            waveform.push(max)
          }

          resolve(waveform)
        })
    })
  }

  async convertFormat(audioBuffer: Buffer, targetFormat: AudioFormat, bitrate = 128): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const inputPath = `/tmp/${Date.now()}_input_audio`
      const outputPath = `/tmp/${Date.now()}_converted.${targetFormat}`

      // Write input buffer to temporary file
      require("fs").writeFileSync(inputPath, audioBuffer)

      let command = ffmpeg(inputPath)

      switch (targetFormat) {
        case AudioFormat.MP3:
          command = command.audioCodec("libmp3lame").audioBitrate(bitrate)
          break
        case AudioFormat.AAC:
          command = command.audioCodec("aac").audioBitrate(bitrate)
          break
        case AudioFormat.OGG:
          command = command.audioCodec("libvorbis").audioBitrate(bitrate)
          break
        case AudioFormat.WAV:
          command = command.audioCodec("pcm_s16le")
          break
        case AudioFormat.FLAC:
          command = command.audioCodec("flac")
          break
      }

      command
        .format(targetFormat)
        .output(outputPath)
        .on("end", () => {
          try {
            const convertedBuffer = require("fs").readFileSync(outputPath)

            // Clean up temp files
            require("fs").unlinkSync(inputPath)
            require("fs").unlinkSync(outputPath)

            resolve(convertedBuffer)
          } catch (readError) {
            reject(readError)
          }
        })
        .on("error", (err) => {
          // Clean up temp files
          require("fs").unlinkSync(inputPath)
          if (require("fs").existsSync(outputPath)) {
            require("fs").unlinkSync(outputPath)
          }
          reject(err)
        })
        .run()
    })
  }

  async generateChecksum(buffer: Buffer): Promise<string> {
    return crypto.createHash("md5").update(buffer).digest("hex")
  }

  private getAudioFormat(formatName: string): AudioFormat {
    if (formatName.includes("mp3")) return AudioFormat.MP3
    if (formatName.includes("wav")) return AudioFormat.WAV
    if (formatName.includes("flac")) return AudioFormat.FLAC
    if (formatName.includes("aac")) return AudioFormat.AAC
    if (formatName.includes("ogg")) return AudioFormat.OGG
    return AudioFormat.MP3 // default
  }
}
