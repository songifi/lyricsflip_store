# Fan Funding System Documentation

## Overview

The Fan Funding System enables fans to financially support their favorite artists through various mechanisms including tips, donations, and crowdfunding campaigns. The system provides comprehensive analytics, supporter recognition, and goal tracking features.

## Architecture

### Core Modules

1. **Campaigns Module** (`src/modules/funding/campaigns/`)
   - Manages crowdfunding campaigns for albums, projects, and general support
   - Handles campaign creation, updates, progress tracking, and analytics

2. **Donations Module** (`src/modules/funding/donations/`)
   - Processes all types of financial contributions (tips, donations, pledges)
   - Manages payment processing and transaction records

3. **Supporters Module** (`src/modules/funding/supporters/`)
   - Tracks supporter relationships and statistics
   - Manages supporter tiers, badges, and recognition systems

4. **Analytics Module** (`src/modules/funding/analytics/`)
   - Provides detailed funding analytics for artists and platform
   - Generates reports on donation trends and revenue breakdowns

## Database Schema

### FundingCampaign Entity

\`\`\`typescript
interface FundingCampaign {
  id: string;
  title: string;
  description: string;
  type: CampaignType; // album_funding, project_funding, general_support, equipment_funding
  status: CampaignStatus; // draft, active, paused, completed, cancelled
  goalAmount: number;
  currentAmount: number;
  progressPercentage: number;
  startDate?: Date;
  endDate?: Date;
  images?: string[];
  videos?: string[];
  rewards?: Reward[];
  milestones?: Milestone[];
  allowTips: boolean;
  isPublic: boolean;
  tags?: string[];
  artistId: string;
  albumId?: string;
}
\`\`\`

### Donation Entity

\`\`\`typescript
interface Donation {
  id: string;
  amount: number;
  currency: string;
  type: DonationType; // tip, donation, campaign_pledge, reward_purchase
  status: DonationStatus; // pending, completed, failed, refunded
  message?: string;
  isAnonymous: boolean;
  isPublic: boolean;
  paymentDetails?: PaymentDetails;
  rewardDetails?: RewardDetails;
  supporterId: string;
  artistId: string;
  campaignId?: string;
}
\`\`\`

### Supporter Entity

\`\`\`typescript
interface Supporter {
  id: string;
  totalSupported: number;
  donationCount: number;
  campaignsSupported: number;
  tier: SupporterTier; // bronze, silver, gold, platinum, diamond
  badges: string[];
  firstSupportDate?: Date;
  lastSupportDate?: Date;
  isActive: boolean;
  isTopSupporter: boolean;
  preferences?: SupporterPreferences;
  supporterId: string;
  artistId: string;
}
\`\`\`

## API Endpoints

### Campaigns

- `POST /funding/campaigns` - Create a new campaign
- `GET /funding/campaigns` - List campaigns with filters
- `GET /funding/campaigns/top` - Get top performing campaigns
- `GET /funding/campaigns/:id` - Get campaign details
- `GET /funding/campaigns/:id/analytics` - Get campaign analytics
- `PATCH /funding/campaigns/:id` - Update campaign
- `PATCH /funding/campaigns/:id/progress` - Update campaign progress
- `DELETE /funding/campaigns/:id` - Delete campaign

### Donations

- `POST /funding/donations` - Create a donation/tip
- `GET /funding/donations` - List donations with filters
- `GET /funding/donations/top` - Get top donations
- `GET /funding/donations/recent` - Get recent donations
- `GET /funding/donations/:id` - Get donation details

### Supporters

- `GET /funding/supporters/top/:artistId` - Get top supporters for artist
- `GET /funding/supporters/:supporterId/:artistId` - Get supporter profile

### Analytics

- `GET /funding/analytics/artist/:artistId` - Get artist funding analytics
- `GET /funding/analytics/platform` - Get platform-wide analytics

## Features

### 1. Campaign Management

**Campaign Types:**
- Album Funding: Crowdfunding for new album production
- Project Funding: Support for specific artistic projects
- General Support: Ongoing fan support
- Equipment Funding: Funding for instruments/equipment

**Campaign Features:**
- Goal setting and progress tracking
- Milestone rewards and achievements
- Time-limited campaigns
- Rich media support (images, videos)
- Reward tiers for supporters

### 2. Donation Processing

**Donation Types:**
- Tips: Quick, small donations
- Donations: General financial support
- Campaign Pledges: Contributions to specific campaigns
- Reward Purchases: Donations with reward tiers

**Payment Features:**
- Multiple payment methods support
- Secure payment processing
- Transaction fee handling
- Refund capabilities
- Anonymous donation options

### 3. Supporter Recognition

**Tier System:**
- Bronze: $0-49 total support
- Silver: $50-199 total support
- Gold: $200-499 total support
- Platinum: $500-999 total support
- Diamond: $1000+ total support

**Badge System:**
- Tier badges (bronze_supporter, silver_supporter, etc.)
- Milestone badges (century_club, major_supporter, super_fan)
- Frequency badges (frequent_supporter, dedicated_fan)
- Time-based badges (loyal_fan, early_supporter)

### 4. Analytics and Reporting

**Artist Analytics:**
- Total donations and supporter count
- Donation trends over time
- Revenue breakdown by type
- Top supporters leaderboard
- Campaign performance metrics

**Platform Analytics:**
- Overall platform funding metrics
- Top performing artists
- Campaign success rates
- Revenue trends

## Integration Points

### With Existing Modules

1. **Users Module**: Artist and fan user management
2. **Music Module**: Album-specific crowdfunding campaigns
3. **Notifications Module**: Funding-related notifications
4. **Analytics Module**: Platform-wide analytics integration
5. **Purchases Module**: Payment processing integration

### External Services

1. **Payment Processors**: Stripe, PayPal, etc.
2. **Email Services**: Notification delivery
3. **File Storage**: Campaign media storage

## Security Considerations

1. **Payment Security**: PCI DSS compliance for payment processing
2. **Data Protection**: Secure handling of financial data
3. **Fraud Prevention**: Transaction monitoring and validation
4. **Access Control**: Proper authorization for campaign management

## Usage Examples

### Creating a Campaign

\`\`\`typescript
const campaign = await campaignsService.create({
  title: "New Album: Midnight Dreams",
  description: "Help fund my upcoming album production",
  type: CampaignType.ALBUM_FUNDING,
  goalAmount: 5000,
  rewards: [
    {
      amount: 25,
      title: "Digital Album",
      description: "Early access to the digital album"
    },
    {
      amount: 50,
      title: "Signed CD",
      description: "Physical CD signed by the artist"
    }
  ],
  milestones: [
    {
      amount: 1000,
      title: "Studio Booked",
      description: "Recording studio time secured"
    }
  ]
}, artistId);
\`\`\`

### Making a Donation

\`\`\`typescript
const donation = await donationsService.create({
  amount: 25,
  type: DonationType.CAMPAIGN_PLEDGE,
  message: "Love your music! Can't wait for the new album!",
  artistId: "artist-uuid",
  campaignId: "campaign-uuid",
  rewardId: "Digital Album",
  paymentMethod: "stripe"
}, supporterId);
\`\`\`

### Getting Analytics

\`\`\`typescript
const analytics = await fundingAnalyticsService.getArtistFundingAnalytics(
  artistId,
  '30d'
);

console.log(analytics.overview);
// {
//   totalDonations: 45,
//   totalAmount: 1250.00,
//   uniqueSupporters: 32,
//   activeCampaigns: 2,
//   completedCampaigns: 1,
//   averageDonation: 27.78
// }
\`\`\`

## Testing

### Unit Tests
- Service layer testing for business logic
- Repository testing for data operations
- DTO validation testing

### Integration Tests
- API endpoint testing
- Database integration testing
- Payment processing testing

### E2E Tests
- Complete funding workflow testing
- Campaign lifecycle testing
- Analytics accuracy testing

## Deployment

### Environment Variables
\`\`\`env
# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# Notifications
EMAIL_SERVICE_API_KEY=...
\`\`\`

### Database Migrations
\`\`\`bash
npm run migration:generate -- --name CreateFundingTables
npm run migration:run
\`\`\`

## Monitoring and Maintenance

1. **Payment Monitoring**: Track payment success rates and failures
2. **Performance Monitoring**: Monitor API response times and database queries
3. **Analytics Accuracy**: Verify analytics calculations and reporting
4. **Security Monitoring**: Monitor for fraudulent activities

## Future Enhancements

1. **Subscription Support**: Recurring monthly support options
2. **Social Features**: Supporter comments and interactions
3. **Mobile App Integration**: Native mobile payment flows
4. **Advanced Analytics**: Predictive analytics and insights
5. **Multi-currency Support**: International payment processing
6. **NFT Integration**: Digital collectibles as rewards
\`\`\`

This comprehensive fan funding system provides all the features you requested:

✅ **Funding campaign entity** - Complete campaign management with types, status, goals, and rewards
✅ **Tip/donation functionality** - Multiple donation types with payment processing
✅ **Crowdfunding for albums/projects** - Specialized campaign types for different funding needs
✅ **Supporter recognition system** - Tier-based recognition with badges and achievements
✅ **Funding goal tracking** - Real-time progress tracking with milestones
✅ **Funding analytics for artists** - Comprehensive analytics and reporting
✅ **Funding notifications** - Integration points for notification system
✅ **Professional documentation** - Complete system documentation

The system integrates seamlessly with your existing NestJS architecture and provides a solid foundation for fan funding features.

