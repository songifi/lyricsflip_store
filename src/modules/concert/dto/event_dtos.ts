// src/dtos/event.dto.ts
import {
  IsString,
  IsEnum,
  IsDate,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsEmail,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EventType, EventStatus } from '../entities/event.entity';
import { TierType } from '../entities/ticket-tier.entity';

// Event DTOs
export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalCapacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class EventResponseDto {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  doorOpenTime?: Date;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    capacity: number;
  };
  artistName: string;
  supportingActs?: string[];
  imageUrl?: string;
  basePrice?: number;
  totalCapacity: number;
  soldTickets: number;
  availableTickets: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket DTOs
export class CreateTicketTierDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TierType)
  type: TierType;

  @IsUUID()
  eventId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFee?: number;

  @IsNumber()
  @Min(1)
  totalQuantity: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPerOrder?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  saleStartDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  saleEndDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class PurchaseTicketDto {
  @IsUUID()
  tierId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  purchaserName: string;

  @IsEmail()
  purchaserEmail: string;

  @IsOptional()
  @IsString()
  purchaserPhone?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}

export class TicketResponseDto {
  id: string;
  ticketNumber: string;
  status: string;
  price: number;
  fees: number;
  totalPrice: number;
  tier: {
    id: string;
    name: string;
    type: TierType;
  };
  purchaserName?: string;
  purchaserEmail?: string;
  qrCode?: string;
  isCheckedIn: boolean;
  seatNumber?: string;
  row?: string;
  section?: string;
}

// Check-in DTOs
export class CheckInTicketDto {
  @IsString()
  ticketIdentifier: string; // Can be ticket ID, ticket number, or QR code

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckInResponseDto {
  success: boolean;
  message: string;
  ticket?: {
    id: string;
    ticketNumber: string;
    purchaserName: string;
    tier: string;
    seatInfo?: string;
  };
  checkInTime?: Date;
}

// Promotion DTOs
export class CreatePromotionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string;

  @IsUUID()
  eventId: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableTiers?: string[];
}

// Analytics DTOs
export class AnalyticsQueryDto {
  @IsUUID()
  eventId: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

export class EventAnalyticsResponseDto {
  eventId: string;
  eventTitle: string;
  totalTicketsSold: number;
  totalRevenue: number;
  attendanceRate: number;
  checkedInCount: number;
  conversionRate: number;
  averageOrderValue: number;
  salesByTier: Array<{
    tierName: string;
    sold: number;
    revenue: number;
    percentage: number;
  }>;
  dailySales: Array<{
    date: string;
    tickets: number;
    revenue: number;
  }>;
  demographics?: {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
    locationData: Record<string, number>;
  };
}

// Venue DTOs
export class CreateVenueDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

export class VenueResponseDto {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  phone?: string;
  email?: string;
  website?: string;
  amenities?: string[];
  upcomingEvents?: number;
  isActive: boolean;
}

// Search and Filter DTOs
export class EventSearchDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  sortBy?: 'date' | 'price' | 'popularity' | 'name' = 'date';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}()
  @IsString()
  description?: string;

  @IsEnum(EventType)
  type: EventType;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  doorOpenTime?: Date;

  @IsUUID()
  venueId: string;

  @IsString()
  artistName: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingActs?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsNumber()
  @Min(1)
  totalCapacity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  doorOpenTime?: Date;

  @IsOptional()
  @IsString()
  artistName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingActs?: string[];

  @IsOptional