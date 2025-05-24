import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Video } from "../entities/video.entity"

interface VideoSEOData {
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogVideo: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  structuredData: any
}

@Injectable()
export class VideoSEOService {
  constructor(private readonly videoRepository: Repository<Video>) {}

  async generateSEOData(videoId: string): Promise<VideoSEOData> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ["artist", "track"],
    })

    if (!video) {
      throw new Error("Video not found")
    }

    const baseTitle = video.seoTitle || video.title
    const baseDescription = video.seoDescription || video.description || ""
    const keywords = this.generateKeywords(video)

    return {
      title: this.optimizeTitle(baseTitle, video),
      description: this.optimizeDescription(baseDescription, video),
      keywords,
      ogTitle: this.generateOGTitle(video),
      ogDescription: this.generateOGDescription(video),
      ogImage: video.thumbnailUrl || video.posterUrl,
      ogVideo: this.getVideoUrl(video),
      twitterTitle: this.generateTwitterTitle(video),
      twitterDescription: this.generateTwitterDescription(video),
      twitterImage: video.thumbnailUrl || video.posterUrl,
      structuredData: this.generateStructuredData(video),
    }
  }

  private optimizeTitle(title: string, video: Video): string {
    const artistName = video.artist?.name || ""
    const trackTitle = video.track?.title || ""

    if (trackTitle && !title.includes(trackTitle)) {
      title = `${trackTitle} - ${title}`
    }

    if (artistName && !title.includes(artistName)) {
      title = `${title} by ${artistName}`
    }

    // Ensure title is within optimal length (50-60 characters)
    if (title.length > 60) {
      title = title.substring(0, 57) + "..."
    }

    return title
  }

  private optimizeDescription(description: string, video: Video): string {
    if (!description) {
      description = this.generateDefaultDescription(video)
    }

    // Add relevant keywords naturally
    const keywords = this.generateKeywords(video)
    const keywordString = keywords.slice(0, 3).join(", ")

    if (!description.toLowerCase().includes(keywordString.toLowerCase())) {
      description += ` Tags: ${keywordString}`
    }

    // Ensure description is within optimal length (150-160 characters)
    if (description.length > 160) {
      description = description.substring(0, 157) + "..."
    }

    return description
  }

  private generateKeywords(video: Video): string[] {
    const keywords = new Set<string>()

    // Add video tags
    if (video.tags) {
      video.tags.forEach((tag) => keywords.add(tag.toLowerCase()))
    }

    // Add artist name
    if (video.artist?.name) {
      keywords.add(video.artist.name.toLowerCase())
    }

    // Add track title words
    if (video.track?.title) {
      const titleWords = video.track.title.toLowerCase().split(" ")
      titleWords.forEach((word) => {
        if (word.length > 2) keywords.add(word)
      })
    }

    // Add video type
    keywords.add(video.type.replace("_", " "))

    // Add genre if available
    if (video.track?.genre) {
      keywords.add(video.track.genre.toLowerCase())
    }

    // Add common music video keywords
    keywords.add("music video")
    keywords.add("official video")
    keywords.add("music")

    return Array.from(keywords).slice(0, 20) // Limit to 20 keywords
  }

  private generateDefaultDescription(video: Video): string {
    const artistName = video.artist?.name || "Unknown Artist"
    const trackTitle = video.track?.title || video.title
    const videoType = video.type.replace("_", " ")

    return `Watch the ${videoType} for "${trackTitle}" by ${artistName}. High quality music video streaming.`
  }

  private generateOGTitle(video: Video): string {
    const artistName = video.artist?.name || ""
    const trackTitle = video.track?.title || video.title

    return `${trackTitle} - ${artistName} (Official Music Video)`
  }

  private generateOGDescription(video: Video): string {
    const artistName = video.artist?.name || "Unknown Artist"
    const trackTitle = video.track?.title || video.title

    return `Watch the official music video for "${trackTitle}" by ${artistName}. Stream high quality music videos.`
  }

  private generateTwitterTitle(video: Video): string {
    return this.generateOGTitle(video)
  }

  private generateTwitterDescription(video: Video): string {
    return this.generateOGDescription(video)
  }

  private getVideoUrl(video: Video): string {
    // Return the URL to the video player page
    return `/videos/${video.id}`
  }

  private generateStructuredData(video: Video): any {
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description: video.description || this.generateDefaultDescription(video),
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: video.createdAt.toISOString(),
      duration: video.duration ? `PT${video.duration}S` : undefined,
      contentUrl: this.getVideoUrl(video),
      embedUrl: `/videos/${video.id}/embed`,
      publisher: {
        "@type": "Organization",
        name: "Your Music Platform",
        logo: {
          "@type": "ImageObject",
          url: "/logo.png",
        },
      },
      creator: video.artist
        ? {
            "@type": "Person",
            name: video.artist.name,
          }
        : undefined,
      associatedMedia: video.track
        ? {
            "@type": "MusicRecording",
            name: video.track.title,
            byArtist: {
              "@type": "Person",
              name: video.artist?.name,
            },
          }
        : undefined,
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/WatchAction",
          userInteractionCount: video.viewCount,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: video.likeCount,
        },
      ],
    }
  }

  async updateVideoSEO(videoId: string, seoData: Partial<VideoSEOData>): Promise<Video> {
    const updateData: any = {}

    if (seoData.title) updateData.seoTitle = seoData.title
    if (seoData.description) updateData.seoDescription = seoData.description
    if (seoData.keywords) updateData.seoKeywords = seoData.keywords.join(", ")

    await this.videoRepository.update(videoId, updateData)

    return await this.videoRepository.findOne({ where: { id: videoId } })
  }
}
