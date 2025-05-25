// src/services/event.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { Venue } from '../entities/venue.entity';
import { TicketTier } from '../entities/ticket-tier.entity';
import { EventAnalytics, AnalyticsType } from '../entities/event-analytics.entity';
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  EventSearchDto,
  EventAnalyticsResponseDto,
} from '../dtos/event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(TicketTier)
    private ticketTierRepository: Repository<TicketTier>,
    @InjectRepository(EventAnalytics)
    private analyticsRepository: Repository<EventAnalytics>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    // Validate venue exists
    const venue = await this.venueRepository.findOne({
      where: { id: createEventDto.venueId },
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    // Validate event dates
    if (createEventDto.startDate >= createEventDto.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (createEventDto.startDate <= new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    // Check venue capacity
    if (createEventDto.totalCapacity > venue.capacity) {
      throw new BadRequestException(
        `Event capacity (${createEventDto.totalCapacity}) exceeds venue capacity (${venue.capacity})`,
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      status: EventStatus.DRAFT,
      soldTickets: 0,
    });

    const savedEvent = await this.eventRepository.save(event);
    return this.mapToResponseDto(savedEvent, venue);
  }

  async findAll(searchDto: EventSearchDto): Promise<{
    events: EventResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { limit = 20, offset = 0, sortBy = 'date', sortOrder = 'asc' } = searchDto;

    const whereConditions: FindOptionsWhere<Event> = {
      isActive: true,
      status: EventStatus.PUBLISHED,
    };

    // Apply search filters
    if (searchDto.query) {
      whereConditions.title = Like(`%${searchDto.query}%`);
    }

    if (searchDto.type) {
      whereConditions.type = searchDto.type;
    }

    if (searchDto.startDate && searchDto.endDate) {
      whereConditions.startDate = Between(searchDto.startDate, searchDto.endDate);
    } else if (searchDto.startDate) {
      // Find events starting after the given date
      whereConditions.startDate = Between(searchDto.startDate, new Date('2030-12-31'));
    }

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .where(whereConditions);

    // Apply city filter on venue
    if (searchDto.city) {
      queryBuilder.andWhere('venue.city ILIKE :city', { city: `%${searchDto.city}%` });
    }

    // Apply price filters if specified
    if (searchDto.minPrice !== undefined || searchDto.maxPrice !== undefined) {
      const tierQuery = this.ticketTierRepository
        .createQueryBuilder('tier')
        .where('tier.eventId = event.id');

      if (searchDto.minPrice !== undefined) {
        tierQuery.andWhere('tier.price >= :minPrice', { minPrice: searchDto.minPrice });
      }

      if (searchDto.maxPrice !== undefined) {
        tierQuery.andWhere('tier.price <= :maxPrice', { maxPrice: searchDto.maxPrice });
      }

      queryBuilder.andWhere(`EXISTS (${tierQuery.getQuery()})`);
      queryBuilder.setParameters(tierQuery.getParameters());
    }

    // Apply sorting
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const events = await queryBuilder.skip(offset).take(limit).getMany();

    const eventDtos = events.map((event) => this.mapToResponseDto(event, event.venue));

    return {
      events: eventDtos,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['venue', 'tickets'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.mapToResponseDto(event, event.venue);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Validate date changes
    if (updateEventDto.startDate && updateEventDto.endDate) {
      if (updateEventDto.startDate >= updateEventDto.endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Don't allow capacity reduction below sold tickets
    if (updateEventDto.totalCapacity && updateEventDto.totalCapacity < event.soldTickets) {
      throw new BadRequestException(
        `Cannot reduce capacity below sold tickets (${event.soldTickets})`,
      );
    }

    Object.assign(event, updateEventDto);
    const updatedEvent = await this.eventRepository.save(event);

    return this.mapToResponseDto(updatedEvent, event.venue);
  }

  async publishEvent(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Only draft events can be published');
    }

    // Validate event has ticket tiers
    const tierCount = await this.ticketTierRepository.count({
      where: { eventId: id, isActive: true },
    });

    if (tierCount === 0) {
      throw new BadRequestException('Event must have at least one active ticket tier');
    }

    event.status = EventStatus.PUBLISHED;
    const publishedEvent = await this.eventRepository.save(event);

    return this.mapToResponseDto(publishedEvent, event.venue);
  }

  async cancelEvent(id: string, reason?: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status === EventStatus.COMPLETED || event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel completed or already cancelled event');
    }

    event.status = EventStatus.CANCELLED;
    if (reason) {
      event.metadata = { ...event.metadata, cancellationReason: reason };
    }

    const cancelledEvent = await this.eventRepository.save(event);

    // TODO: Trigger refund process for sold tickets
    // TODO: Send cancellation notifications

    return this.mapToResponseDto(cancelledEvent, event.venue);
  }

  async getEventAnalytics(eventId: string): Promise<EventAnalyticsResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['venue', 'tickets'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Get analytics data
    const analytics = await this.analyticsRepository.find({
      where: { eventId },
      order: { recordDate: 'ASC' },
    });

    // Get ticket tiers with sales data
    const tiers = await this.ticketTierRepository.find({
      where: { eventId },
      relations: ['tickets'],
    });

    // Calculate summary metrics
    const totalTicketsSold = event.soldTickets;
    const totalRevenue = tiers.reduce((sum, tier) => sum + (tier.soldQuantity * tier.price), 0);
    const checkedInCount = event.tickets?.filter(ticket => ticket.isCheckedIn).length || 0;
    const attendanceRate = totalTicketsSold > 0 ? (checkedInCount / totalTicketsSold) * 100 : 0;

    // Calculate sales by tier
    const salesByTier = tiers.map(tier => ({
      tierName: tier.name,
      sold: tier.soldQuantity,
      revenue: tier.soldQuantity * tier.price,
      percentage: totalTicketsSold > 0 ? (tier.soldQuantity / totalTicketsSold) * 100 : 0,
    }));

    // Get daily sales data
    const dailySales = analytics
      .filter(a => a.type === AnalyticsType.DAILY_SALES)
      .map(a => ({
        date: a.recordDate.toISOString().split('T')[0],
        tickets: a.ticketsSold,
        revenue: a.revenue,
      }));

    // Calculate average order value
    const averageOrderValue = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;

    // Get demographic data from latest analytics record
    const latestDemographics = analytics
      .filter(a => a.type === AnalyticsType.DEMOGRAPHIC)
      .pop();

    return {
      eventId: event.id,
      eventTitle: event.title,
      totalTicketsSold,
      totalRevenue,
      attendanceRate,
      checkedInCount,
      conversionRate: 0, // TODO: Calculate from page views
      averageOrderValue,
      salesByTier,
      dailySales,
      demographics: latestDemographics ? {
        ageGroups: latestDemographics.ageGroups,
        genderDistribution: latestDemographics.genderDistribution,
        locationData: latestDemographics.locationData,
      } : undefined,
    };
  }

  async getRecommendedEvents(userId?: string, limit: number = 10): Promise<EventResponseDto[]> {
    // Simple recommendation algorithm - can be enhanced with ML
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('event.isActive = :isActive', { isActive: true })
      .andWhere('event.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('event.startDate > :now', { now: new Date() })
      .orderBy('event.startDate', 'ASC')
      .take(limit);

    // TODO: Enhance with user preferences, purchase history, location, etc.
    const events = await queryBuilder.getMany();

    return events.map(event => this.mapToResponseDto(event, event.venue));
  }

  async remove(id: string): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.soldTickets > 0) {
      throw new BadRequestException('Cannot delete event with sold tickets');
    }

    await this.eventRepository.remove(event);
  }

  private getSortField(sortBy: string): string {
    const sortFields = {
      date: 'event.startDate',
      price: 'event.basePrice',
      popularity: 'event.soldTickets',
      name: 'event.title',
    };

    return sortFields[sortBy] || sortFields.date;
  }

  private mapToResponseDto(event: Event, venue?: Venue): EventResponseDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      doorOpenTime: event.doorOpenTime,
      venue: venue ? {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        city: venue.city,
        capacity: venue.capacity,
      } : undefined,
      artistName: event.artistName,
      supportingActs: event.supportingActs,
      imageUrl: event.imageUrl,
      basePrice: event.basePrice,
      totalCapacity: event.totalCapacity,
      soldTickets: event.soldTickets,
      availableTickets: event.totalCapacity - event.soldTickets,
      isActive: event.isActive,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}