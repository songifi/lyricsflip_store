// ==================== DTOs ====================

// venue.dto.ts
import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsArray()
  @IsString({ each: true })
  facilities: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  contactEmail: string;

  @IsString()
  contactPhone: string;
}

export class UpdateVenueDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  facilities?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;
}

// booking.dto.ts
export class CreateBookingDto {
  @IsString()
  venueId: string;

  @IsString()
  artistName: string;

  @IsString()
  eventName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  expectedAttendance: number;

  @IsString()
  @IsOptional()
  specialRequirements?: string;

  @IsString()
  contactEmail: string;

  @IsString()
  contactPhone: string;
}

export class UpdateBookingDto {
  @IsString()
  @IsOptional()
  artistName?: string;

  @IsString()
  @IsOptional()
  eventName?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  expectedAttendance?: number;

  @IsString()
  @IsOptional()
  specialRequirements?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;
}

// pricing.dto.ts
export class CreatePricingDto {
  @IsString()
  venueId: string;

  @IsString()
  packageName: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  weekendMultiplier?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  holidayMultiplier?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedServices?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePricingDto {
  @IsString()
  @IsOptional()
  packageName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  weekendMultiplier?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  holidayMultiplier?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedServices?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}

// technical-specs.dto.ts
export class CreateTechnicalSpecDto {
  @IsString()
  venueId: string;

  @IsArray()
  @IsString({ each: true })
  soundEquipment: string[];

  @IsArray()
  @IsString({ each: true })
  lightingEquipment: string[];

  @IsString()
  stageSize: string;

  @IsNumber()
  powerCapacity: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additionalEquipment?: string[];

  @IsString()
  @IsOptional()
  technicalNotes?: string;
}

export class UpdateTechnicalSpecDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  soundEquipment?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lightingEquipment?: string[];

  @IsString()
  @IsOptional()
  stageSize?: string;

  @IsNumber()
  @IsOptional()
  powerCapacity?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additionalEquipment?: string[];

  @IsString()
  @IsOptional()
  technicalNotes?: string;
}

// promotion.dto.ts
export class CreatePromotionDto {
  @IsString()
  venueId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  discountPercentage: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudience?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  discountPercentage?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudience?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// partnership.dto.ts
export class CreatePartnershipDto {
  @IsString()
  venueId: string;

  @IsString()
  partnerName: string;

  @IsString()
  partnerType: string; // 'venue', 'supplier', 'promoter', 'agency'

  @IsString()
  contactEmail: string;

  @IsString()
  contactPhone: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  collaborationTypes?: string[];
}

export class UpdatePartnershipDto {
  @IsString()
  @IsOptional()
  partnerName?: string;

  @IsString()
  @IsOptional()
  partnerType?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  collaborationTypes?: string[];
}

// ==================== SERVICES ====================

// venue.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async create(createVenueDto: CreateVenueDto): Promise<Venue> {
    const venue = this.venueRepository.create(createVenueDto);
    return await this.venueRepository.save(venue);
  }

  async findAll(): Promise<Venue[]> {
    return await this.venueRepository.find({
      relations: ['bookings', 'pricingPackages', 'technicalSpecs', 'promotions', 'partnerships'],
    });
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['bookings', 'pricingPackages', 'technicalSpecs', 'promotions', 'partnerships'],
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return venue;
  }

  async update(id: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    const venue = await this.findOne(id);
    Object.assign(venue, updateVenueDto);
    return await this.venueRepository.save(venue);
  }

  async remove(id: string): Promise<void> {
    const venue = await this.findOne(id);
    await this.venueRepository.remove(venue);
  }

  async findByCity(city: string): Promise<Venue[]> {
    return await this.venueRepository.find({
      where: { city },
      relations: ['bookings', 'pricingPackages'],
    });
  }

  async findByCapacityRange(minCapacity: number, maxCapacity: number): Promise<Venue[]> {
    return await this.venueRepository.find({
      where: {
        capacity: Between(minCapacity, maxCapacity),
      },
    });
  }
}

// booking.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { VenueService } from './venue.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private venueService: VenueService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const venue = await this.venueService.findOne(createBookingDto.venueId);
    
    // Check for double bookings
    const conflictingBookings = await this.bookingRepository.find({
      where: {
        venue: { id: createBookingDto.venueId },
        startDate: Between(new Date(createBookingDto.startDate), new Date(createBookingDto.endDate)),
      },
    });

    if (conflictingBookings.length > 0) {
      throw new ConflictException('Venue is already booked for the selected time period');
    }

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      venue,
      startDate: new Date(createBookingDto.startDate),
      endDate: new Date(createBookingDto.endDate),
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: ['venue'],
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    
    // If dates are being updated, check for conflicts
    if (updateBookingDto.startDate || updateBookingDto.endDate) {
      const startDate = updateBookingDto.startDate ? new Date(updateBookingDto.startDate) : booking.startDate;
      const endDate = updateBookingDto.endDate ? new Date(updateBookingDto.endDate) : booking.endDate;
      
      const conflictingBookings = await this.bookingRepository.find({
        where: {
          venue: { id: booking.venue.id },
          id: { $ne: id } as any,
          startDate: Between(startDate, endDate),
        },
      });

      if (conflictingBookings.length > 0) {
        throw new ConflictException('Venue is already booked for the selected time period');
      }
    }

    Object.assign(booking, {
      ...updateBookingDto,
      startDate: updateBookingDto.startDate ? new Date(updateBookingDto.startDate) : booking.startDate,
      endDate: updateBookingDto.endDate ? new Date(updateBookingDto.endDate) : booking.endDate,
    });

    return await this.bookingRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }

  async findByVenue(venueId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { venue: { id: venueId } },
      relations: ['venue'],
      order: { startDate: 'ASC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: {
        startDate: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['venue'],
    });
  }

  async getVenueCalendar(venueId: string, month: number, year: number): Promise<Booking[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.bookingRepository.find({
      where: {
        venue: { id: venueId },
        startDate: Between(startDate, endDate),
      },
      order: { startDate: 'ASC' },
    });
  }
}

// pricing.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenuePricing } from './entities/venue-pricing.entity';
import { CreatePricingDto, UpdatePricingDto } from './dto/pricing.dto';
import { VenueService } from './venue.service';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(VenuePricing)
    private pricingRepository: Repository<VenuePricing>,
    private venueService: VenueService,
  ) {}

  async create(createPricingDto: CreatePricingDto): Promise<VenuePricing> {
    const venue = await this.venueService.findOne(createPricingDto.venueId);
    
    const pricing = this.pricingRepository.create({
      ...createPricingDto,
      venue,
    });

    return await this.pricingRepository.save(pricing);
  }

  async findAll(): Promise<VenuePricing[]> {
    return await this.pricingRepository.find({
      relations: ['venue'],
    });
  }

  async findOne(id: string): Promise<VenuePricing> {
    const pricing = await this.pricingRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing package with ID ${id} not found`);
    }

    return pricing;
  }

  async update(id: string, updatePricingDto: UpdatePricingDto): Promise<VenuePricing> {
    const pricing = await this.findOne(id);
    Object.assign(pricing, updatePricingDto);
    return await this.pricingRepository.save(pricing);
  }

  async remove(id: string): Promise<void> {
    const pricing = await this.findOne(id);
    await this.pricingRepository.remove(pricing);
  }

  async findByVenue(venueId: string): Promise<VenuePricing[]> {
    return await this.pricingRepository.find({
      where: { venue: { id: venueId } },
      relations: ['venue'],
    });
  }

  async calculatePrice(pricingId: string, date: Date): Promise<number> {
    const pricing = await this.findOne(pricingId);
    let price = pricing.basePrice;

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend && pricing.weekendMultiplier) {
      price *= (1 + pricing.weekendMultiplier);
    }

    // Simple holiday check (you can expand this)
    const isHoliday = this.isHoliday(date);
    if (isHoliday && pricing.holidayMultiplier) {
      price *= (1 + pricing.holidayMultiplier);
    }

    return Math.round(price * 100) / 100;
  }

  private isHoliday(date: Date): boolean {
    // Simplified holiday detection - expand as needed
    const month = date.getMonth();
    const day = date.getDate();
    
    // New Year's Day
    if (month === 0 && day === 1) return true;
    // Christmas
    if (month === 11 && day === 25) return true;
    
    return false;
  }
}

// technical-specs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueTechnicalSpecs } from './entities/venue-technical-specs.entity';
import { CreateTechnicalSpecDto, UpdateTechnicalSpecDto } from './dto/technical-specs.dto';
import { VenueService } from './venue.service';

@Injectable()
export class TechnicalSpecsService {
  constructor(
    @InjectRepository(VenueTechnicalSpecs)
    private techSpecsRepository: Repository<VenueTechnicalSpecs>,
    private venueService: VenueService,
  ) {}

  async create(createTechSpecDto: CreateTechnicalSpecDto): Promise<VenueTechnicalSpecs> {
    const venue = await this.venueService.findOne(createTechSpecDto.venueId);
    
    const techSpecs = this.techSpecsRepository.create({
      ...createTechSpecDto,
      venue,
    });

    return await this.techSpecsRepository.save(techSpecs);
  }

  async findAll(): Promise<VenueTechnicalSpecs[]> {
    return await this.techSpecsRepository.find({
      relations: ['venue'],
    });
  }

  async findOne(id: string): Promise<VenueTechnicalSpecs> {
    const techSpecs = await this.techSpecsRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!techSpecs) {
      throw new NotFoundException(`Technical specs with ID ${id} not found`);
    }

    return techSpecs;
  }

  async findByVenue(venueId: string): Promise<VenueTechnicalSpecs> {
    const techSpecs = await this.techSpecsRepository.findOne({
      where: { venue: { id: venueId } },
      relations: ['venue'],
    });

    if (!techSpecs) {
      throw new NotFoundException(`Technical specs for venue ${venueId} not found`);
    }

    return techSpecs;
  }

  async update(id: string, updateTechSpecDto: UpdateTechnicalSpecDto): Promise<VenueTechnicalSpecs> {
    const techSpecs = await this.findOne(id);
    Object.assign(techSpecs, updateTechSpecDto);
    return await this.techSpecsRepository.save(techSpecs);
  }

  async remove(id: string): Promise<void> {
    const techSpecs = await this.findOne(id);
    await this.techSpecsRepository.remove(techSpecs);
  }
}

// promotion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VenuePromotion } from './entities/venue-promotion.entity';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { VenueService } from './venue.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(VenuePromotion)
    private promotionRepository: Repository<VenuePromotion>,
    private venueService: VenueService,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<VenuePromotion> {
    const venue = await this.venueService.findOne(createPromotionDto.venueId);
    
    const promotion = this.promotionRepository.create({
      ...createPromotionDto,
      venue,
      startDate: new Date(createPromotionDto.startDate),
      endDate: new Date(createPromotionDto.endDate),
    });

    return await this.promotionRepository.save(promotion);
  }

  async findAll(): Promise<VenuePromotion[]> {
    return await this.promotionRepository.find({
      relations: ['venue'],
    });
  }

  async findOne(id: string): Promise<VenuePromotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<VenuePromotion> {
    const promotion = await this.findOne(id);
    Object.assign(promotion, {
      ...updatePromotionDto,
      startDate: updatePromotionDto.startDate ? new Date(updatePromotionDto.startDate) : promotion.startDate,
      endDate: updatePromotionDto.endDate ? new Date(updatePromotionDto.endDate) : promotion.endDate,
    });
    return await this.promotionRepository.save(promotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }

  async findByVenue(venueId: string): Promise<VenuePromotion[]> {
    return await this.promotionRepository.find({
      where: { venue: { id: venueId } },
      relations: ['venue'],
      order: { startDate: 'DESC' },
    });
  }

  async findActivePromotions(): Promise<VenuePromotion[]> {
    const now = new Date();
    return await this.promotionRepository.find({
      where: {
        isActive: true,
        startDate: Between(now, new Date('2099-12-31')),
        endDate: Between(now, new Date('2099-12-31')),
      },
      relations: ['venue'],
    });
  }
}

// analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { Booking } from './entities/booking.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async getVenuePerformance(venueId: string, year: number): Promise<any> {
    const venue = await this.venueRepository.findOne({
      where: { id: venueId },
      relations: ['bookings'],
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${venueId} not found`);
    }

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const bookings = await this.bookingRepository.find({
      where: {
        venue: { id: venueId },
        startDate: Between(yearStart, yearEnd),
      },
    });

    const totalBookings = bookings.length;
    const totalAttendance = bookings.reduce((sum, booking) => sum + booking.expectedAttendance, 0);
    const averageAttendance = totalBookings > 0 ? totalAttendance / totalBookings : 0;
    const utilizationRate = (totalAttendance / (venue.capacity * totalBookings)) * 100;

    const monthlyStats = Array.from({ length: 12 }, (_, month) => {
      const monthBookings = bookings.filter(booking => 
        booking.startDate.getMonth() === month
      );
      return {
        month: month + 1,
        bookings: monthBookings.length,
        attendance: monthBookings.reduce((sum, booking) => sum + booking.expectedAttendance, 0),
      };
    });

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        capacity: venue.capacity,
      },
      year,
      summary: {
        totalBookings,
        totalAttendance,
        averageAttendance: Math.round(averageAttendance),
        utilizationRate: Math.round(utilizationRate * 100) / 100,
      },
      monthlyStats,
    };
  }

  async getSystemOverview(): Promise<any> {
    const totalVenues = await this.venueRepository.count();
    const totalBookings = await this.bookingRepository.count();
    
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    
    const yearlyBookings = await this.bookingRepository.count({
      where: {
        startDate: Between(yearStart, yearEnd),
      },
    });

    const topVenues = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('venue.name', 'venueName')
      .addSelect('COUNT(*)', 'bookingCount')
      .leftJoin('booking.venue', 'venue')
      .where('booking.startDate >= :yearStart', { yearStart })
      .groupBy('venue.id')
      .orderBy('bookingCount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      summary: {
        totalVenues,
        totalBookings,
        yearlyBookings,
      },
      topVenues,
    };
  }
}

// partnership.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenuePartnership } from './entities/venue-partnership.entity';
import { CreatePartnershipDto, UpdatePartnershipDto } from './dto/partnership.dto';
import { VenueService } from './venue.service';

@Injectable()
export class PartnershipService {
  constructor(
    @InjectRepository(VenuePartnership)
    private partnershipRepository: Repository<VenuePartnership>,
    private venueService: VenueService,
  ) {}

  async create(createPartnershipDto: CreatePartnershipDto): Promise<VenuePartnership> {
    const venue = await this.venueService.findOne(createPartnershipDto.venueId);
    
    const partnership = this.partnershipRepository.create({
      ...createPartnershipDto,
      venue,
    });

    return await this.partnershipRepository.save(partnership);
  }

  async findAll(): Promise<VenuePartnership[]> {
    return await this.partnershipRepository.find({
      relations: ['venue'],
    });
  }

  async findOne(id: string): Promise<VenuePartnership> {
    const partnership = await this.partnershipRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!partnership) {
      throw new NotFoundException(`Partnership with ID ${id} not found`);
    }

    return partnership;
  }

  async update(id: string, updatePartnershipDto: UpdatePartnershipDto): Promise<VenuePartnership> {
    const partnership = await this.findOne(id);
    Object.assign(partnership, updatePartnershipDto);
    return await this.partnershipRepository.save(partnership);
  }

  async remove(id: string): Promise<void> {
    const partnership = await this.findOne(id);
    await this.partnershipRepository.remove(partnership);
  }

  async findByVenue(venueId: string): Promise<VenuePartnership[]> {
    return await this.partnershipRepository.find({
      where: { venue: { id: venueId } },
      relations: ['venue'],
    });
  }

  async findByPartnerType(partnerType: string): Promise<VenuePartnership[]> {
    return await this.partnershipRepository.find({
      where: { partnerType },
      relations: ['venue'],
    });
  }
}

// ==================== CONTROLLERS ====================

// venue.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VenueService } from '../services/venue.service';
import { CreateVenueDto, UpdateVenueDto } from '../dto/venue.dto';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  create(@Body() createVenueDto: CreateVenueDto) {
    return this.venueService.create(createVenueDto);
  }

  @Get()
  findAll() {
    return this.venueService.findAll();
  }

  @Get('city/:city')
  findByCity(@Param('city') city: string) {
    return this.venueService.findByCity(city);
  }

  @Get('capacity')
  findByCapacity(@Query('min') min: string, @Query('max') max: string) {
    return this.venueService.findByCapacityRange(parseInt(min), parseInt(max));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venueService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    return this.venueService.update(id, updateVenueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.venueService.remove(id);
  }
}

// booking.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.bookingService.findByVenue(venueId);
  }

  @Get('calendar/:venueId')
  getVenueCalendar(
    @Param('venueId') venueId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.bookingService.getVenueCalendar(venueId, parseInt(month), parseInt(year));
  }

  @Get('date-range')
  findByDateRange(@Query('start') start: string, @Query('end') end: string) {
    return this.bookingService.findByDateRange(start, end);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}

// pricing.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PricingService } from '../services/pricing.service';
import { CreatePricingDto, UpdatePricingDto } from '../dto/pricing.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  create(@Body() createPricingDto: CreatePricingDto) {
    return this.pricingService.create(createPricingDto);
  }

  @Get()
  findAll() {
    return this.pricingService.findAll();
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.pricingService.findByVenue(venueId);
  }

  @Get(':id/calculate')
  calculatePrice(@Param('id') id: string, @Query('date') date: string) {
    return this.pricingService.calculatePrice(id, new Date(date));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePricingDto: UpdatePricingDto) {
    return this.pricingService.update(id, updatePricingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingService.remove(id);
  }
}

// technical-specs.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TechnicalSpecsService } from '../services/technical-specs.service';
import { CreateTechnicalSpecDto, UpdateTechnicalSpecDto } from '../dto/technical-specs.dto';

@Controller('technical-specs')
export class TechnicalSpecsController {
  constructor(private readonly technicalSpecsService: TechnicalSpecsService) {}

  @Post()
  create(@Body() createTechnicalSpecDto: CreateTechnicalSpecDto) {
    return this.technicalSpecsService.create(createTechnicalSpecDto);
  }

  @Get()
  findAll() {
    return this.technicalSpecsService.findAll();
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.technicalSpecsService.findByVenue(venueId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technicalSpecsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTechnicalSpecDto: UpdateTechnicalSpecDto) {
    return this.technicalSpecsService.update(id, updateTechnicalSpecDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicalSpecsService.remove(id);
  }
}

// promotion.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PromotionService } from '../services/promotion.service';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/promotion.dto';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Get()
  findAll() {
    return this.promotionService.findAll();
  }

  @Get('active')
  findActivePromotions() {
    return this.promotionService.findActivePromotions();
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.promotionService.findByVenue(venueId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }
}

// analytics.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getSystemOverview() {
    return this.analyticsService.getSystemOverview();
  }

  @Get('venue/:venueId/performance')
  getVenuePerformance(@Param('venueId') venueId: string, @Query('year') year: string) {
    return this.analyticsService.getVenuePerformance(venueId, parseInt(year) || new Date().getFullYear());
  }
}

// partnership.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PartnershipService } from '../services/partnership.service';
import { CreatePartnershipDto, UpdatePartnershipDto } from '../dto/partnership.dto';

@Controller('partnerships')
export class PartnershipController {
  constructor(private readonly partnershipService: PartnershipService) {}

  @Post()
  create(@Body() createPartnershipDto: CreatePartnershipDto) {
    return this.partnershipService.create(createPartnershipDto);
  }

  @Get()
  findAll() {
    return this.partnershipService.findAll();
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.partnershipService.findByVenue(venueId);
  }

  @Get('type/:partnerType')
  findByPartnerType(@Param('partnerType') partnerType: string) {
    return this.partnershipService.findByPartnerType(partnerType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnershipService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartnershipDto: UpdatePartnershipDto) {
    return this.partnershipService.update(id, updatePartnershipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnershipService.remove(id);
  }
}

// ==================== ENTITIES ====================

// entities/venue.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';
import { VenuePricing } from './venue-pricing.entity';
import { VenueTechnicalSpecs } from './venue-technical-specs.entity';
import { VenuePromotion } from './venue-promotion.entity';
import { VenuePartnership } from './venue-partnership.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column('json')
  facilities: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, booking => booking.venue)
  bookings: Booking[];

  @OneToMany(() => VenuePricing, pricing => pricing.venue)
  pricingPackages: VenuePricing[];

  @OneToMany(() => VenueTechnicalSpecs, specs => specs.venue)
  technicalSpecs: VenueTechnicalSpecs[];

  @OneToMany(() => VenuePromotion, promotion => promotion.venue)
  promotions: VenuePromotion[];

  @OneToMany(() => VenuePartnership, partnership => partnership.venue)
  partnerships: VenuePartnership[];
}

// entities/booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  artistName: string;

  @Column()
  eventName: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'int' })
  expectedAttendance: number;

  @Column({ type: 'text', nullable: true })
  specialRequirements: string;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Venue, venue => venue.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}

// entities/venue-pricing.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_pricing')
export class VenuePricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  packageName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  weekendMultiplier: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  holidayMultiplier: number;

  @Column('json', { nullable: true })
  includedServices: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Venue, venue => venue.pricingPackages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}

// entities/venue-technical-specs.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_technical_specs')
export class VenueTechnicalSpecs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json')
  soundEquipment: string[];

  @Column('json')
  lightingEquipment: string[];

  @Column()
  stageSize: string;

  @Column({ type: 'int' })
  powerCapacity: number;

  @Column('json', { nullable: true })
  additionalEquipment: string[];

  @Column({ type: 'text', nullable: true })
  technicalNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Venue, venue => venue.technicalSpecs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}

// entities/venue-promotion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('venue_promotions')
export class VenuePromotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  discountPercentage: number;

  @Column('json', { nullable: true })
  targetAudience: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Venue, venue => venue.promotions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}

// entities/venue-partnership.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Venue } from './venue.entity';

export enum PartnerType {
  VENUE = 'venue',
  SUPPLIER = 'supplier',
  PROMOTER = 'promoter',
  AGENCY = 'agency'
}

@Entity('venue_partnerships')
export class VenuePartnership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  partnerName: string;

  @Column({
    type: 'enum',
    enum: PartnerType
  })
  partnerType: PartnerType;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('json', { nullable: true })
  collaborationTypes: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Venue, venue => venue.partnerships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}

// ==================== MODULE ====================

// venue.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { Booking } from './entities/booking.entity';
import { VenuePricing } from './entities/venue-pricing.entity';
import { VenueTechnicalSpecs } from './entities/venue-technical-specs.entity';
import { VenuePromotion } from './entities/venue-promotion.entity';
import { VenuePartnership } from './entities/venue-partnership.entity';

import { VenueService } from './services/venue.service';
import { BookingService } from './services/booking.service';
import { PricingService } from './services/pricing.service';
import { TechnicalSpecsService } from './services/technical-specs.service';
import { PromotionService } from './services/promotion.service';
import { AnalyticsService } from './services/analytics.service';
import { PartnershipService } from './services/partnership.service';

import { VenueController } from './controllers/venue.controller';
import { BookingController } from './controllers/booking.controller';
import { PricingController } from './controllers/pricing.controller';
import { TechnicalSpecsController } from './controllers/technical-specs.controller';
import { PromotionController } from './controllers/promotion.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { PartnershipController } from './controllers/partnership.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venue,
      Booking,
      VenuePricing,
      VenueTechnicalSpecs,
      VenuePromotion,
      VenuePartnership,
    ]),
  ],
  controllers: [
    VenueController,
    BookingController,
    PricingController,
    TechnicalSpecsController,
    PromotionController,
    AnalyticsController,
    PartnershipController,
  ],
  providers: [
    VenueService,
    BookingService,
    PricingService,
    TechnicalSpecsService,
    PromotionService,
    AnalyticsService,
    PartnershipService,
  ],
  exports: [
    VenueService,
    BookingService,
    PricingService,
    TechnicalSpecsService,
    PromotionService,
    AnalyticsService,
    PartnershipService,
  ],
})
export class VenueModule {}

// ==================== DOCUMENTATION ====================

/*
# Venue Management System Documentation

## Overview
This module provides a comprehensive system for managing music venues, bookings, and venue-specific features.

## Features Implemented

### 1. Venue Management
- Create, read, update, delete venues
- Store venue details including capacity, facilities, location
- Search venues by city or capacity range

### 2. Booking Calendar System
- Create and manage bookings
- Automatic double-booking prevention
- Venue calendar view by month/year
- Booking status tracking (pending, confirmed, cancelled, completed)

### 3. Venue-Specific Pricing
- Multiple pricing packages per venue
- Weekend and holiday multipliers
- Dynamic price calculation based on date
- Included services tracking

### 4. Technical Specifications
- Sound and lighting equipment lists
- Stage dimensions and power capacity
- Additional equipment tracking
- Technical notes for artists

### 5. Promotion and Marketing
- Time-based promotional campaigns
- Discount percentage management
- Target audience segmentation
- Active promotion filtering

### 6. Analytics and Performance
- Venue performance metrics
- Monthly booking statistics
- Utilization rate calculations
- System overview dashboard

### 7. Partnership Network
- Partner management (venues, suppliers, promoters, agencies)
- Collaboration type tracking
- Contact information management

## API Endpoints

### Venues
- POST /venues - Create venue
- GET /venues - List all venues
- GET /venues/:id - Get venue details
- PATCH /venues/:id - Update venue
- DELETE /venues/:id - Delete venue
- GET /venues/city/:city - Get venues by city
- GET /venues/capacity?min=X&max=Y - Get venues by capacity range

### Bookings
- POST /bookings - Create booking
- GET /bookings - List all bookings
- GET /bookings/:id - Get booking details
- PATCH /bookings/:id - Update booking
- DELETE /bookings/:id - Cancel booking
- GET /bookings/venue/:venueId - Get venue bookings
- GET /bookings/calendar/:venueId?month=X&year=Y - Get venue calendar

### Pricing
- POST /pricing - Create pricing package
- GET /pricing/venue/:venueId - Get venue pricing
- GET /pricing/:id/calculate?date=YYYY-MM-DD - Calculate price for date

### Technical Specs
- POST /technical-specs - Create technical specs
- GET /technical-specs/venue/:venueId - Get venue technical specs

### Promotions
- POST /promotions - Create promotion
- GET /promotions/active - Get active promotions
- GET /promotions/venue/:venueId - Get venue promotions

### Analytics
- GET /analytics/overview - System overview
- GET /analytics/venue/:venueId/performance?year=YYYY - Venue performance

### Partnerships
- POST /partnerships - Create partnership
- GET /partnerships/venue/:venueId - Get venue partnerships
- GET /partnerships/type/:partnerType - Get partnerships by type

## Database Schema

### Tables Created:
1. venues - Main venue information
2. bookings - Event bookings
3. venue_pricing - Pricing packages
4. venue_technical_specs - Technical specifications
5. venue_promotions - Marketing promotions
6. venue_partnerships - Business partnerships

## Key Features

### Double-Booking Prevention
The system automatically checks for conflicting bookings when creating or updating reservations.

### Dynamic Pricing
Prices automatically adjust based on:
- Weekend multipliers
- Holiday multipliers
- Base pricing packages

### Comprehensive Analytics
Track venue performance with:
- Booking counts
- Attendance tracking
- Utilization rates
- Monthly statistics

## Usage Example

```typescript
// Create a venue
const venue = await venueService.create({
  name: "The Music Hall",
  address: "123 Main St",
  city: "New York",
  country: "USA",
  capacity: 500,
  facilities: ["sound_system", "lighting", "bar"],
  contactEmail: "contact@musichall.com",
  contactPhone: "+1-555-0123"
});

// Create a booking
const booking = await bookingService.create({
  venueId: venue.id,
  artistName: "The Rock Band",
  eventName: "Summer Concert",
  startDate: "2024-07-15T19:00:00Z",
  endDate: "2024-07-15T23:00:00Z",
  expectedAttendance: 400,
  contactEmail: "band@example.com",
  contactPhone: "+1-555-0456"
});
```

## Installation

1. Import the VenueModule in your main app module
2. Configure TypeORM with your PostgreSQL database
3. Run migrations to create the database tables
4. Start using the API endpoints

The module is fully self-contained and can be easily integrated into any NestJS application.
*/