# Festival Management System

A comprehensive festival management system built with NestJS and TypeScript, designed to handle all aspects of planning and managing music festivals and multi-artist events.

## Features

### 🎪 Festival Management
- **Multi-stage Support**: Create and manage multiple stages with different capacities and technical specifications
- **Event Scheduling**: Comprehensive scheduling system with conflict detection
- **Status Tracking**: Track festival progress from planning to completion

### 🎵 Artist & Performance Management
- **Artist Booking**: Manage artist contracts, fees, and technical requirements
- **Schedule Management**: Prevent scheduling conflicts across stages
- **Performance Tracking**: Monitor performance status from scheduled to completed

### 🏪 Vendor Coordination
- **Vendor Management**: Handle food, beverage, merchandise, and service vendors
- **Location Assignment**: Assign vendors to specific festival locations
- **Revenue Tracking**: Track vendor fees and revenue sharing

### 💰 Sponsor Management
- **Tier-based Sponsorship**: Support for different sponsorship levels (Title, Presenting, Major, etc.)
- **Deliverable Tracking**: Monitor sponsor deliverables and deadlines
- **Brand Guidelines**: Store and manage sponsor branding requirements

### 🗺️ Festival Map & Navigation
- **Interactive Maps**: Comprehensive festival location mapping
- **Navigation System**: Help attendees find stages, vendors, facilities
- **Accessibility Features**: Support for accessibility requirements

### 👥 Attendee Experience
- **Personal Schedules**: Attendees can create custom performance schedules
- **Recommendations**: AI-powered recommendations based on preferences
- **Check-in/Check-out**: Digital attendee management

### 📊 Analytics & Reporting
- **Real-time Analytics**: Track attendance, revenue, and engagement
- **Daily Reports**: Automated daily festival reports
- **Performance Metrics**: Detailed analytics on all festival aspects

## Installation

1. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Database Setup**
\`\`\`bash
# Run migrations
npm run migration:run

# Seed database (optional)
npm run seed
\`\`\`

3. **Environment Configuration**
\`\`\`bash
# Copy environment template
cp .env.example .env

# Configure your database and other settings
\`\`\`

## API Endpoints

### Festivals
- `GET /festivals` - List all festivals
- `POST /festivals` - Create new festival
- `GET /festivals/:id` - Get festival details
- `PATCH /festivals/:id` - Update festival
- `DELETE /festivals/:id` - Delete festival
- `GET /festivals/:id/statistics` - Get festival statistics

### Schedule Management
- `POST /festivals/:id/performances` - Schedule new performance
- `GET /festivals/:id/schedule` - Get festival schedule
- `GET /festivals/:id/schedule/conflicts` - Check for scheduling conflicts

### Vendor Management
- `GET /festivals/:id/vendors` - Get festival vendors
- `POST /festivals/:id/vendors` - Add vendor
- `PATCH /vendors/:id/status` - Update vendor status

### Sponsor Management
- `GET /festivals/:id/sponsors` - Get festival sponsors
- `POST /festivals/:id/sponsors` - Add sponsor
- `PATCH /sponsors/:id/status` - Update sponsor status

### Map & Navigation
- `GET /festivals/:id/map` - Get festival map
- `GET /festivals/:id/locations/:type` - Get locations by type
- `POST /festivals/:id/navigation` - Get navigation route

### Attendee Experience
- `GET /festivals/:id/attendees/:userId/schedule` - Get personal schedule
- `POST /festivals/:id/attendees/:userId/schedule` - Add to personal schedule
- `GET /festivals/:id/attendees/:userId/recommendations` - Get recommendations

### Analytics
- `GET /festivals/:id/analytics` - Get festival analytics
- `POST /festivals/:id/analytics` - Record analytics data

## Database Schema

### Core Entities

#### Festival
- Basic festival information (name, dates, location)
- Capacity and ticket pricing
- Status tracking
- Social media links

#### Stage
- Stage specifications and capacity
- Technical requirements
- Location coordinates
- Performance scheduling

#### Performance
- Artist scheduling with time slots
- Technical requirements
- Fee tracking
- Status management

#### Vendor
- Vendor information and contact details
- Location assignment
- Operating hours and menu
- Fee and revenue sharing

#### Sponsor
- Sponsorship tiers and values
- Deliverable tracking
- Brand guidelines
- Contract management

#### Festival Location
- Map locations for navigation
- Amenities and accessibility
- Operating hours
- Capacity limits

#### Festival Attendee
- Ticket information
- Personal schedules
- Preferences and recommendations
- Check-in/check-out tracking

#### Festival Analytics
- Performance metrics
- Revenue tracking
- Attendance data
- Custom analytics

## Usage Examples

### Creating a Festival
\`\`\`typescript
const festival = await festivalsService.create({
  name: "Summer Music Festival 2024",
  description: "Three days of amazing music",
  startDate: "2024-07-15",
  endDate: "2024-07-17",
  location: "Central Park, New York",
  capacity: 50000,
  ticketPrice: 299.99
});
\`\`\`

### Scheduling a Performance
\`\`\`typescript
const performance = await scheduleService.createPerformance({
  artistId: "artist-uuid",
  stageId: "stage-uuid",
  startTime: "2024-07-15T20:00:00Z",
  endTime: "2024-07-15T21:30:00Z",
  isHeadliner: true,
  fee: 100000
});
\`\`\`

### Getting Festival Analytics
\`\`\`typescript
const analytics = await analyticsService.getFestivalAnalytics(festivalId);
console.log(`Total Revenue: $${analytics.revenue.total}`);
console.log(`Occupancy Rate: ${analytics.summary.occupancyRate}%`);
\`\`\`

## Best Practices

### Scheduling
- Always check for conflicts before scheduling performances
- Allow buffer time between performances for setup/teardown
- Consider artist travel time between festivals

### Vendor Management
- Verify vendor licenses and insurance
- Coordinate vendor setup times
- Monitor vendor performance and customer feedback

### Attendee Experience
- Provide clear navigation and signage
- Offer accessibility accommodations
- Implement efficient check-in processes

### Analytics
- Track key metrics in real-time
- Generate daily reports for stakeholders
- Use data to improve future festivals

## Security Considerations

- All endpoints require authentication
- Role-based access control for different user types
- Sensitive data encryption
- Audit logging for important operations

## Performance Optimization

- Database indexing on frequently queried fields
- Caching for static data (maps, schedules)
- Pagination for large datasets
- Background jobs for analytics processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
