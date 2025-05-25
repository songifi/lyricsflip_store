import type { ContentType, ViolationType } from "../entities/moderation-case.entity"

export interface ContentScanResult {
  isViolation: boolean
  violationTypes: ViolationType[]
  confidenceScore: number
  details: Record<string, any>
  scanDuration?: number
  scannerVersion?: string
}

export interface ContentScanner {
  scanContent(contentType: ContentType, contentId: string, content: any): Promise<ContentScanResult>
  getSupportedContentTypes(): ContentType[]
  getConfidenceThreshold(): number
}

export interface AudioScanResult extends ContentScanResult {
  audioFeatures?: {
    duration: number
    bitrate: number
    sampleRate: number
  }
  transcription?: string
  languageDetection?: string
}

export interface ImageScanResult extends ContentScanResult {
  imageFeatures?: {
    width: number
    height: number
    format: string
    size: number
  }
  objectDetection?: Array<{
    label: string
    confidence: number
    boundingBox?: any
  }>
  textExtraction?: string
}

export interface TextScanResult extends ContentScanResult {
  languageDetection?: string
  sentiment?: {
    score: number
    magnitude: number
  }
  toxicity?: {
    score: number
    categories: string[]
  }
}
