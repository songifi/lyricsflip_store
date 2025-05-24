# Merchandise Management System

A comprehensive merchandise management system for artists to sell physical products, built with NestJS and TypeScript.

## Features

### ✅ Merchandise Management
- **Product Creation**: Support for various product types (apparel, accessories, vinyl, CDs, posters, collectibles)
- **Hierarchical Categories**: Tree-structured category system with parent-child relationships
- **Variant System**: Handle different product options (sizes, colors, designs, materials, editions)
- **Rich Media**: Image gallery support with primary image selection and metadata
- **SEO-Friendly**: Auto-generated slugs for URLs and search engine optimization

### ✅ Inventory Management
- **Real-time Tracking**: Accurate inventory quantity tracking
- **Reservation System**: Reserve inventory for pending orders
- **Low Stock Alerts**: Configurable low stock thresholds with automatic status updates
- **Multiple Locations**: Support for different storage locations
- **Restock Management**: Track restocking dates and expected availability

### ✅ Pricing & Bundles
- **Flexible Pricing**: Base prices with variant-specific modifiers
- **Bundle System**: Create product bundles with discounts
- **Limited Editions**: Handle scarcity with limited quantity tracking
- **Pre-orders**: Support for pre-order functionality with release dates
- **Compare Pricing**: Show original vs. sale prices

### ✅ Advanced Features
- **Search & Filtering**: Comprehensive search with multiple filter options
- **Artist Management**: Multi-artist support with artist-specific products
- **Status Management**: Draft, active, inactive, and discontinued states
- **Metadata Support**: Flexible JSON metadata for custom attributes
- **Audit Trail**: Created/updated timestamps for all entities

## Database Schema

### Core Entities

1. **MerchandiseCategory**
   - Hierarchical tree structure using closure table
   - Support for different merchandise types
   - SEO-friendly slugs

2. **Merchandise**
   - Main product entity with rich metadata
   - Support for limited editions and pre-orders
   - Flexible pricing structure

3. **MerchandiseVariant**
   - Product variations (size, color, design, etc.)
   - Individual SKUs and pricing modifiers
   - Image support for each variant

4. **MerchandiseInventory**
   - Real-time quantity tracking
   - Reservation system for order processing
   - Status management (in stock, low stock, out of stock)

5. **MerchandiseBundle**
   - Bundle multiple products together
   - Flexible pricing with discount calculations
   - Support for different bundle types

## API Endpoints

### Merchandise
- `GET /merchandise` - List merchandise with filters
- `POST /merchandise` - Create new merchandise
- `GET /merchandise/:id` - Get merchandise by ID
- `GET /merchandise/slug/:slug` - Get merchandise by slug
- `PATCH /merchandise/:id` - Update merchandise
- `DELETE /merchandise/:id` - Delete merchandise

### Categories
- `GET /merchandise/categories` - Get category tree
- `POST /merchandise/categories` - Create category
- `GET /merchandise/categories/:id` - Get category details
- `GET /merchandise/categories/:id/descendants` - Get category descendants

### Bundles
- `GET /merchandise/bundles` - List bundles
- `POST /merchandise/bundles` - Create bundle
- `GET /merchandise/bundles/:id` - Get bundle details
- `GET /merchandise/bundles/:id/savings` - Calculate bundle savings

### Inventory
- `GET /merchandise/inventory/report` - Get inventory report
- `PATCH /merchandise/:variantId/inventory` - Update inventory
- `POST /merchandise/:variantId/reserve` - Reserve inventory
- `POST /merchandise/:variantId/release` - Release reserved inventory

## Installation

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Database Setup**
   \`\`\`bash
   # Run migrations
   npm run migration:run
   
   # Seed initial data
   npm run seed:run
   \`\`\`

3. **Environment Variables**
   \`\`\`env
   DATABASE_URL=postgresql://username:password@localhost:5432/database
   JWT_SECRET=your-jwt-secret
   \`\`\`

## Usage Examples

### Creating Merchandise

\`\`\`typescript
const merchandise = await merchandiseService.create({
  name: 'Artist T-Shirt',
  artistId: 'artist-uuid',
  categoryId: 'category-uuid',
  basePrice: 25.00,
  description: 'High-quality cotton t-shirt with artist design',
  isLimitedEdition: true,
  limitedEditionQuantity: 100,
  variants: [
    {
      name: 'Small Black',
      sku: 'TSHIRT-S-BLK',
      type: 'size',
      value: 'Small',
      initialQuantity: 25
    },
    {
      name: 'Medium Black',
      sku: 'TSHIRT-M-BLK',
      type: 'size',
      value: 'Medium',
      initialQuantity: 35
    }
  ],
  images: [
    {
      url: 'https://example.com/tshirt-front.jpg',
      isPrimary: true,
      altText: 'T-shirt front view'
    }
  ]
});
\`\`\`

### Creating Bundles

\`\`\`typescript
const bundle = await bundleService.create({
  name: 'Complete Fan Package',
  artistId: 'artist-uuid',
  type: BundleType.FIXED,
  price: 75.00,
  compareAtPrice: 95.00,
  items: [
    {
      merchandiseId: 'tshirt-uuid',
      quantity: 1
    },
    {
      merchandiseId: 'vinyl-uuid',
      quantity: 1
    },
    {
      merchandiseId: 'poster-uuid',
      quantity: 1
    }
  ]
});
\`\`\`

### Inventory Management

\`\`\`typescript
// Update inventory
await merchandiseService.updateInventory('variant-uuid', 50);

// Reserve inventory for order
const reserved = await merchandiseService.reserveInventory('variant-uuid', 2);

// Get inventory report
const report = await merchandiseService.getInventoryReport('artist-uuid');
\`\`\`

## Security

- **JWT Authentication**: Secure API endpoints with JWT tokens
- **Role-based Access**: Different permissions for artists and admins
- **Input Validation**: Comprehensive DTO validation with class-validator
- **SQL Injection Protection**: TypeORM provides built-in protection

## Performance

- **Database Indexes**: Optimized indexes for common query patterns
- **Pagination**: Built-in pagination for large datasets
- **Efficient Queries**: Optimized TypeORM queries with proper joins
- **Caching Ready**: Structure supports Redis caching implementation

## Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.
