import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Podcast, PodcastStatus } from "../../../database/entities/podcast.entity"
import type { CreatePodcastDto } from "../dto/create-podcast.dto"
import type { UpdatePodcastDto } from "../dto/update-podcast.dto"

@Injectable()
export class PodcastsService {
  private podcastRepository: Repository<Podcast>

  constructor(
    @InjectRepository(Podcast)
    podcastRepository: Repository<Podcast>,
  ) {
    this.podcastRepository = podcastRepository;
  }

  async create(createPodcastDto: CreatePodcastDto, ownerId: string): Promise<Podcast> {
    const podcast = this.podcastRepository.create({
      ...createPodcastDto,
      ownerId,
    })

    return this.podcastRepository.save(podcast)
  }

  async findAll(page = 1, limit = 10): Promise<{ podcasts: Podcast[]; total: number }> {
    const [podcasts, total] = await this.podcastRepository.findAndCount({
      where: { status: PodcastStatus.PUBLISHED },
      relations: ["owner", "episodes"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    })

    return { podcasts, total }
  }

  async findOne(id: string): Promise<Podcast> {
    const podcast = await this.podcastRepository.findOne({
      where: { id },
      relations: ["owner", "episodes", "series", "subscriptions"],
    })

    if (!podcast) {
      throw new NotFoundException("Podcast not found")
    }

    return podcast
  }

  async findByOwner(ownerId: string, page = 1, limit = 10): Promise<{ podcasts: Podcast[]; total: number }> {
    const [podcasts, total] = await this.podcastRepository.findAndCount({
      where: { ownerId },
      relations: ["episodes"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    })

    return { podcasts, total }
  }

  async update(id: string, updatePodcastDto: UpdatePodcastDto, userId: string): Promise<Podcast> {
    const podcast = await this.findOne(id)

    if (podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only update your own podcasts")
    }

    await this.podcastRepository.update(id, updatePodcastDto)
    return this.findOne(id)
  }

  async remove(id: string, userId: string): Promise<void> {
    const podcast = await this.findOne(id)

    if (podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only delete your own podcasts")
    }

    await this.podcastRepository.delete(id)
  }

  async publish(id: string, userId: string): Promise<Podcast> {
    const podcast = await this.findOne(id)

    if (podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only publish your own podcasts")
    }

    await this.podcastRepository.update(id, { status: PodcastStatus.PUBLISHED })
    return this.findOne(id)
  }

  async archive(id: string, userId: string): Promise<Podcast> {
    const podcast = await this.findOne(id)

    if (podcast.ownerId !== userId) {
      throw new ForbiddenException("You can only archive your own podcasts")
    }

    await this.podcastRepository.update(id, { status: PodcastStatus.ARCHIVED })
    return this.findOne(id)
  }
}
