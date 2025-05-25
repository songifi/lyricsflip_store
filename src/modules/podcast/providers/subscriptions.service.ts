import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { PodcastSubscription } from "../../../database/entities/podcast-subscription.entity"
import { Podcast } from "../../../database/entities/podcast.entity"

@Injectable()
export class SubscriptionsService {
  private subscriptionRepository: Repository<PodcastSubscription>
  private podcastRepository: Repository<Podcast>

  constructor(
    @InjectRepository(PodcastSubscription)
    subscriptionRepository: Repository<PodcastSubscription>,
    @InjectRepository(Podcast)
    podcastRepository: Repository<Podcast>,
  ) {
    this.subscriptionRepository = subscriptionRepository
    this.podcastRepository = podcastRepository
  }

  async subscribe(userId: string, podcastId: string): Promise<PodcastSubscription> {
    const podcast = await this.podcastRepository.findOne({
      where: { id: podcastId },
    })

    if (!podcast) {
      throw new NotFoundException("Podcast not found")
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { userId, podcastId },
    })

    if (existingSubscription) {
      throw new ConflictException("Already subscribed to this podcast")
    }

    const subscription = this.subscriptionRepository.create({
      userId,
      podcastId,
    })

    return this.subscriptionRepository.save(subscription)
  }

  async unsubscribe(userId: string, podcastId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, podcastId },
    })

    if (!subscription) {
      throw new NotFoundException("Subscription not found")
    }

    await this.subscriptionRepository.delete(subscription.id)
  }

  async getUserSubscriptions(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ subscriptions: PodcastSubscription[]; total: number }> {
    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where: { userId },
      relations: ["podcast"],
      skip: (page - 1) * limit,
      take: limit,
      order: { subscribedAt: "DESC" },
    })

    return { subscriptions, total }
  }

  async getPodcastSubscribers(
    podcastId: string,
    page = 1,
    limit = 10,
  ): Promise<{ subscriptions: PodcastSubscription[]; total: number }> {
    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where: { podcastId },
      relations: ["user"],
      skip: (page - 1) * limit,
      take: limit,
      order: { subscribedAt: "DESC" },
    })

    return { subscriptions, total }
  }

  async updateNotificationSettings(
    userId: string,
    podcastId: string,
    notificationsEnabled: boolean,
  ): Promise<PodcastSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, podcastId },
    })

    if (!subscription) {
      throw new NotFoundException("Subscription not found")
    }

    await this.subscriptionRepository.update(subscription.id, { notificationsEnabled })

    return this.subscriptionRepository.findOne({
      where: { id: subscription.id },
      relations: ["podcast"],
    })
  }

  async updateLastListened(userId: string, podcastId: string): Promise<void> {
    await this.subscriptionRepository.update({ userId, podcastId }, { lastListenedAt: new Date() })
  }
}
