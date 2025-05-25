import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Podcast } from "../../../database/entities/podcast.entity"
import { type Episode, EpisodeStatus } from "../../../database/entities/episode.entity"

@Injectable()
export class RssService {
  constructor(
    private readonly podcastRepository: Repository<Podcast>,
    private readonly episodeRepository: Repository<Episode>,
  ) {}

  async generateRssFeed(podcastId: string): Promise<string> {
    const podcast = await this.podcastRepository.findOne({
      where: { id: podcastId },
      relations: ["owner"],
    })

    if (!podcast) {
      throw new NotFoundException("Podcast not found")
    }

    const episodes = await this.episodeRepository.find({
      where: { podcastId, status: EpisodeStatus.PUBLISHED },
      order: { publishedAt: "DESC" },
      take: 100, // Limit to latest 100 episodes
    })

    const rssXml = this.buildRssXml(podcast, episodes)
    return rssXml
  }

  private buildRssXml(podcast: Podcast, episodes: Episode[]): string {
    const escapeXml = (text: string): string => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
    }

    const formatDate = (date: Date): string => {
      return date.toUTCString()
    }

    const episodeItems = episodes
      .map((episode) => {
        return `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description><![CDATA[${episode.description}]]></description>
      <pubDate>${formatDate(episode.publishedAt)}</pubDate>
      <guid isPermaLink="false">${episode.id}</guid>
      <enclosure url="${episode.audioUrl}" length="${episode.fileSize}" type="${episode.mimeType}" />
      <itunes:duration>${this.formatDuration(episode.duration)}</itunes:duration>
      <itunes:explicit>${episode.explicit ? "yes" : "no"}</itunes:explicit>
      ${episode.episodeNumber ? `<itunes:episode>${episode.episodeNumber}</itunes:episode>` : ""}
      ${episode.summary ? `<itunes:summary><![CDATA[${episode.summary}]]></itunes:summary>` : ""}
      ${episode.coverImageUrl ? `<itunes:image href="${episode.coverImageUrl}" />` : ""}
    </item>`
      })
      .join("")

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <description><![CDATA[${podcast.description}]]></description>
    <link>${podcast.website || ""}</link>
    <language>${podcast.language || "en"}</language>
    <copyright>${escapeXml(podcast.copyright || "")}</copyright>
    <managingEditor>${podcast.contactEmail || ""} (${escapeXml(podcast.author || "")})</managingEditor>
    <webMaster>${podcast.contactEmail || ""}</webMaster>
    <pubDate>${formatDate(podcast.updatedAt)}</pubDate>
    <lastBuildDate>${formatDate(new Date())}</lastBuildDate>
    <generator>Your Platform Name</generator>
    <ttl>60</ttl>
    <itunes:author>${escapeXml(podcast.author || "")}</itunes:author>
    <itunes:summary><![CDATA[${podcast.summary || podcast.description}]]></itunes:summary>
    <itunes:owner>
      <itunes:name>${escapeXml(podcast.author || "")}</itunes:name>
      <itunes:email>${podcast.contactEmail || ""}</itunes:email>
    </itunes:owner>
    <itunes:image href="${podcast.coverImageUrl || ""}" />
    <itunes:category text="${this.mapCategoryToItunes(podcast.category)}" />
    <itunes:explicit>${podcast.explicit ? "yes" : "no"}</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    ${episodeItems}
  </channel>
</rss>`
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  private mapCategoryToItunes(category: string): string {
    const categoryMap: Record<string, string> = {
      arts: "Arts",
      business: "Business",
      comedy: "Comedy",
      education: "Education",
      fiction: "Fiction",
      government: "Government",
      health_fitness: "Health & Fitness",
      history: "History",
      kids_family: "Kids & Family",
      leisure: "Leisure",
      music: "Music",
      news: "News",
      religion_spirituality: "Religion & Spirituality",
      science: "Science",
      society_culture: "Society & Culture",
      sports: "Sports",
      technology: "Technology",
      true_crime: "True Crime",
      tv_film: "TV & Film",
    }

    return categoryMap[category] || "Other"
  }
}
