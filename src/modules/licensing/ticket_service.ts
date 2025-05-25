// src/services/ticket.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { TicketTier, TierType } from '../entities/ticket-tier.entity';
import { Event } from '../entities/event.entity';
import { EventPromotion } from '../entities/event-promotion.entity';
import {
  CreateTicketTierDto,
  PurchaseTicketDto,
  TicketResponseDto,
} from '../dtos/event.dto';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketTier)
    private ticketTierRepository: Repository<TicketTier>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventPromotion)
    private promotionRepository: Repository<EventPromotion>,
    private dataSource: DataSource,
  ) {}

  async createTicketTier(createTierDto: CreateTicketTierDto): Promise<TicketTier> {
    // Validate event exists
    const event = await this.eventRepository.findOne({
      where: { id: createTierDto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Validate tier quantity doesn't exceed event capacity
    const existingTiers = await this.ticketTierRepository.find({
      where: { eventId: createTierDto.eventId },
    });

    const totalExistingQuantity = existingTiers.reduce(
      (sum, tier) => sum + tier.totalQuantity,
      0,
    );

    if (totalExistingQuantity + createTierDto.totalQuantity > event.totalCapacity) {
      throw new BadRequestException(
        'Total tier quantities exceed event capacity',
      );
    }

    // Validate sale dates
    if (createTierDto.saleStartDate && createTierDto.saleEndDate) {
      if (createTierDto.saleStartDate >= createTierDto.saleEndDate) {
        throw new BadRequestException(
          'Sale start date must be before sale end date',
        );
      }

      if (createTierDto.saleEndDate > event.startDate) {
        throw new BadRequestException(
          'Sale end date cannot be after event start date',
        );
      }
    }

    const tier = this.ticketTierRepository.create({
      ...createTierDto,
      serviceFee: createTierDto.serviceFee || 0,
      soldQuantity: 0,
      reservedQuantity: 0,
    });

    return this.ticketTierRepository.save(tier);
  }

  async purchaseTickets(purchaseDto: PurchaseTicketDto): Promise<TicketResponseDto[]> {
    return this.dataSource.transaction(async (manager) => {
      // Get ticket tier with lock
      const tier = await manager.findOne(TicketTier, {
        where: { id: purchaseDto.tierId },
        relations: ['event'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!tier) {
        throw new NotFoundException('Ticket tier not found');
      }

      // Validate purchase
      this.validatePurchase(tier, purchaseDto);

      // Apply promotion if provided
      let discount = 0;
      if (purchaseDto.promoCode) {
        discount = await this.applyPromotion(
          purchaseDto.promoCode,
          tier.eventId,
          purchaseDto.quantity,
          tier.price,
        );
      }

      // Calculate pricing
      const basePrice = tier.price;
      const fees = tier.serviceFee;
      const discountAmount = discount;
      const totalPricePerTicket = basePrice + fees - discountAmount;
      const totalOrderAmount = totalPricePerTicket * purchaseDto.quantity;

      // Create tickets
      const tickets: Ticket[] = [];
      for (let i = 0; i < purchaseDto.quantity; i++) {
        const ticketNumber = this.generateTicketNumber();
        const qrCode = await this.generateQRCode(ticketNumber, tier.eventId);

        const ticket = manager.create(Ticket, {
          ticketNumber,
          eventId: tier.eventId,
          tierId: tier.id,
          status: TicketStatus.SOLD,
          price: basePrice,
          fees,
          totalPrice: totalPricePerTicket,
          purchaserName: purchaseDto.purchaserName,
          purchaserEmail: purchaseDto.purchaserEmail,
          purchaserPhone: purchaseDto.purchaserPhone,
          purchaseDate: new Date(),
          qrCode,
          // TODO: Integrate with payment processor
          paymentId: `payment_${uuidv4()}`,
        });

        tickets.push(ticket);
      }

      // Save tickets
      const savedTickets = await manager.save(Ticket, tickets);

      // Update tier sold quantity
      tier.soldQuantity += purchaseDto.quantity;
      await manager.save(TicketTier, tier);

      // Update event sold tickets
      const event = tier.event;
      event.soldTickets += purchaseDto.quantity;
      await manager.save(Event, event);

      // TODO: Send confirmation email
      // TODO: Process payment
      // TODO: Update analytics

      return savedTickets.map(ticket => this.mapToTicketResponseDto(ticket, tier));
    });
  }

  async findTicketsByEvent(eventId: string): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketRepository.find({
      where: { eventId },
      relations: ['tier'],
      order: { createdAt: 'DESC' },
    });

    return tickets.map(ticket => this.mapToTicketResponseDto(ticket, ticket.tier));
  }

  async findTicketsByPurchaser(email: string): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketRepository.find({
      where: { purchaserEmail: email },
      relations: ['tier', 'event'],
      order: { createdAt: 'DESC' },
    });

    return tickets.map(ticket => this.mapToTicketResponseDto(ticket, ticket.tier));
  }

  async findTicket(ticketId: string): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['tier'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.mapToTicketResponseDto(ticket, ticket.tier);
  }

  async cancelTicket(ticketId: string, reason?: string): Promise<TicketResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const ticket = await manager.findOne(Ticket, {
        where: { id: ticketId },
        relations: ['tier', 'event'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }

      if (ticket.status !== TicketStatus.SOLD) {
        throw new BadRequestException('Only sold tickets can be cancelled');
      }

      if (ticket.isCheckedIn) {
        throw new BadRequestException('Cannot cancel checked-in ticket');
      }

      // Update ticket status
      ticket.status = TicketStatus.CANCELLED;
      if (reason) {
        ticket.metadata = { ...ticket.metadata, cancellationReason: reason };
      }

      // Update quantities
      const tier = ticket.tier;
      tier.soldQuantity -= 1;
      await manager.save