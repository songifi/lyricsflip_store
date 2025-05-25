# Gear Marketplace Module

A comprehensive marketplace module for buying, selling, and renting musical instruments and equipment in your NestJS application.

## Features

### Core Functionality
- **Gear Listings**: Create detailed listings with specifications, images, and pricing
- **Condition Reports**: Comprehensive condition assessment system
- **Image Gallery**: Multiple images per listing with primary image selection
- **Search & Filtering**: Advanced search with category, price, location, and condition filters
- **User Management**: Integration with existing user system

### Rental System
- **Flexible Pricing**: Daily, weekly, and monthly rental rates
- **Availability Management**: Automatic conflict detection for rental dates
- **Security Deposits**: Configurable deposit system based on gear value
- **Insurance Options**: Optional insurance for high-value items
- **Rental Status Tracking**: Complete lifecycle management

### Verification System
- **Multi-type Verification**: Authenticity, condition, ownership, and technical verification
- **Evidence Upload**: Support for images, documents, and certificates
- **Expert Review**: Admin workflow for verification processing
- **Trust Indicators**: Verified badges for authenticated gear

### Shipping & Insurance
- **Multiple Shipping Options**: Standard, express, overnight, white-glove, and freight
- **Insurance Integration**: Optional insurance for valuable items
- **Cost Calculation**: Automatic shipping cost calculation
- **Tracking Support**: Built-in tracking capabilities

## Installation

1. **Add to your main app module**:
\`\`\`typescript
import { GearModule } from './modules/gear/gear.module';

@Module({
  imports: [
    // ... other modules
    GearModule,
  ],
})
export class AppModule {}
\`\`\`

2. **Run the migration**:
\`\`\`bash
npm run typeorm:migration:run
\`\`\`

3. **Seed sample data** (optional):
\`\`\`bash
npm run seed:gear
\`\`\`

## API Endpoints

### Gear Management
- `GET /gear` - List gear with filtering and pagination
- `GET /gear/:id` - Get gear details
- `POST /gear` - Create new gear listing
- `PATCH /gear/:id` - Update gear listing
- `DELETE /gear/:id` - Delete gear listing
- `POST /gear/:id/favorite` - Toggle favorite status

### Rental System
- `POST /gear/rentals` - Create rental request
- `GET /gear/rentals/my-rentals` - Get user's rentals
- `GET /gear/rentals/gear/:gearId` - Get rentals for specific gear
- `PATCH /gear/rentals/:id/status` - Update rental status

### Verification System
- `POST /gear/verifications` - Request verification
- `GET /gear/verifications/gear/:gearId` - Get gear verifications
- `GET /gear/verifications/pending` - Get pending verifications (admin)
- `PATCH /gear/verifications/:id` - Process verification (admin)

## Usage Examples

### Creating a Gear Listing
\`\`\`typescript
const gearData = {
  title: 'Fender Player Stratocaster',
  description: 'Excellent condition electric guitar...',
  category: GearCategory.GUITARS,
  brand: 'Fender',
  model: 'Player Stratocaster',
  condition: GearCondition.EXCELLENT,
  price: 850.00,
  allowsRental: true,
  rentalPriceDaily: 25.00,
  specifications: {
    bodyWood: 'Alder',
    neckWood: 'Maple',
    pickups: 'Single-coil'
  },
  images: [
    {
      url: 'https://example.com/guitar-front.jpg',
      alt: 'Front view',
      isPrimary: true
    },
    {
      url: 'https://example.com/guitar-back.jpg',
      alt: 'Back view'
    }
  ]
};

const gear = await gearService.create(gearData, userId);
\`\`\`

### Searching for Gear
\`\`\`typescript
const searchParams = {
  category: GearCategory.GUITARS,
  minPrice: 500,
  maxPrice: 1000,
  condition: GearCondition.EXCELLENT,
  allowsRental: true,
  location: 'New York',
  sortBy: 'price',
  sortOrder: 'ASC',
  page: 1,
  limit: 20
};

const results = await gearService.findAll(searchParams);
\`\`\`

### Creating a Rental
\`\`\`typescript
const rentalData = {
  gearId: 'gear-uuid',
  startDate: '2024-01-15',
  endDate: '2024-01-22',
  insuranceRequired: true
};

const rental = await gearRentalService.createRental(rentalData, userId);
\`\`\`

### Requesting Verification
\`\`\`typescript
const verificationData = {
  gearId: 'gear-uuid',
  type: VerificationType.AUTHENTICITY,
  notes: 'Please verify this vintage guitar',
  evidence: {
    images: ['cert1.jpg', 'serial.jpg'],
    certificates: ['authenticity-cert.pdf']
  }
};

const verification = await gearVerificationService.requestVerification(
  verificationData, 
  userId
);
\`\`\`

## Database Schema

The module creates the following tables:
- `gear` - Main gear listings
- `gear_images` - Image gallery for each gear item
- `gear_rentals` - Rental transactions and history
- `gear_verifications` - Verification requests and results
- `gear_shipping` - Shipping options and costs

## Configuration

### Environment Variables
\`\`\`env
# Database configuration (if using separate DB)
GEAR_DB_HOST=localhost
GEAR_DB_PORT=5432
GEAR_DB_USERNAME=gear_user
GEAR_DB_PASSWORD=gear_password
GEAR_DB_DATABASE=gear_marketplace

# File upload configuration
MAX_IMAGE_SIZE=5MB
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp

# Rental configuration
DEFAULT_SECURITY_DEPOSIT_PERCENTAGE=20
DEFAULT_INSURANCE_PERCENTAGE=5
\`\`\`

### Integration with Existing Modules

The gear module integrates seamlessly with your existing modules:

- **Users Module**: Links gear to sellers and renters
- **Auth Module**: Protects endpoints with authentication
- **Purchases Module**: Can be extended for gear sales
- **Analytics Module**: Provides marketplace analytics data
- **Notifications Module**: Sends alerts for rentals, verifications, etc.

## Security Considerations

1. **Authentication**: All write operations require authentication
2. **Authorization**: Users can only modify their own gear
3. **Input Validation**: Comprehensive DTO validation
4. **File Upload Security**: Validate image types and sizes
5. **SQL Injection Protection**: Uses TypeORM query builder
6. **Rate Limiting**: Implement rate limiting for API endpoints

## Performance Optimizations

1. **Database Indexes**: Optimized indexes for common queries
2. **Pagination**: Built-in pagination for large datasets
3. **Eager Loading**: Efficient relationship loading
4. **Caching**: Consider implementing Redis caching for popular searches
5. **Image Optimization**: Compress and resize images before storage

## Testing

\`\`\`typescript
// Example test for gear service
describe('GearService', () => {
  it('should create gear successfully', async () => {
    const gearData = {
      title: 'Test Guitar',
      // ... other properties
    };
    
    const result = await gearService.create(gearData, 'user-id');
    expect(result.title).toBe('Test Guitar');
  });
});
\`\`\`

## Future Enhancements

1. **Payment Integration**: Integrate with Stripe/PayPal for transactions
2. **Real-time Chat**: Add messaging between buyers and sellers
3. **Mobile App Support**: Optimize APIs for mobile applications
4. **AI-powered Recommendations**: Suggest gear based on user preferences
5. **Blockchain Verification**: Implement blockchain-based authenticity verification
6. **Augmented Reality**: AR features for virtual gear inspection

## Support

For questions or issues with the gear marketplace module:
1. Check the API documentation
2. Review the test files for usage examples
3. Consult the database schema for data relationships
4. Contact the development team for custom modifications

This module provides a solid foundation for a professional musical instrument marketplace with room for future enhancements and customizations based on your specific business requirements.
