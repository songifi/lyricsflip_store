import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Episode, EpisodeStatus } from "../../../database/entities/episode.entity"
import { Podcast } from "../../../database/entities/podcast.entity"
import type { CreateEpisodeDto } from "../dto/create-episode.dto"
import type { UpdateEpisodeDto } from "../dto/update-episode.dto"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    @InjectRepository(Podcast)
    private podcastRepository: Repository<Podcast>,
  ) { }

  async create(podcastId: string, createEpisodeDto: CreateEpisodeDto, userId: string): Promise<Episode> {
    const podcast = await this.podcastRepository.findOne({
      where: { id: podcastId },
    })

    if (!podcast) {
      throw new NotFoundException("Podcast not found")
    }

    if (podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only add episodes to your own podcasts")
    }

    const episode = this.episodeRepository.create({
      ...createEpisodeDto,
      podcastId,
      publishedAt: createEpisodeDto.scheduledAt ? new Date(createEpisodeDto.scheduledAt) : null,
    })

    return this.episodeRepository.save(episode)
  }

  async findByPodcast(podcastId: string, page = 1, limit = 10): Promise<{ episodes: Episode[]; total: number }> {
    const [episodes, total] = await this.episodeRepository.findAndCount({
      where: { podcastId, status: EpisodeStatus.PUBLISHED },
      relations: ["chapters", "season"],
      skip: (page - 1) * limit,
      take: limit,
      order: { publishedAt: "DESC" },
    })

    return { episodes, total }
  }

  async findOne(id: string): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({
      where: { id },
      relations: ["podcast", "chapters", "season"],
    })

    if (!episode) {
      throw new NotFoundException("Episode not found")
    }

    return episode
  }

  async update(id: string, updateEpisodeDto: UpdateEpisodeDto, userId: string): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({
      where: { id },
      relations: ["podcast"],
    })

    if (!episode) {
      throw new NotFoundException("Episode not found")
    }

    if (episode.podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only update episodes from your own podcasts")
    }

    await this.episodeRepository.update(id, updateEpisodeDto)
    return this.findOne(id)
  }

  async remove(id: string, userId: string): Promise<void> {
    const episode = await this.episodeRepository.findOne({
      where: { id },
      relations: ["podcast"],
    })

    if (!episode) {
      throw new NotFoundException("Episode not found")
    }

    if (episode.podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only delete episodes from your own podcasts")
    }

    await this.episodeRepository.delete(id)
  }

  async publish(id: string, userId: string): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({
      where: { id },
      relations: ["podcast"],
    })

    if (!episode) {
      throw new NotFoundException("Episode not found")
    }

    if (episode.podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only publish episodes from your own podcasts")
    }

    await this.episodeRepository.update(id, {
      status: EpisodeStatus.PUBLISHED,
      publishedAt: new Date(),
    })

    return this.findOne(id)
  }
}
