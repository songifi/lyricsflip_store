# 🎵 Music & Merchandise Platform

A comprehensive music streaming and merchandise platform built with NestJS, PostgreSQL, and TypeORM. This platform empowers artists to distribute their music, sell merchandise, connect with fans, and manage their music business all in one place.

## 🚀 Features

### 🎧 Music Management
- **Track & Album Management** - Upload, organize, and distribute music content
- **Audio Streaming** - High-quality streaming with multiple bitrate options
- **Playlist System** - Create, share, and collaborate on playlists
- **Music Charts** - Real-time charts and trending algorithms
- **Genre Classification** - Hierarchical genre system for better discovery

### 🛍️ Merchandise
- **Product Management** - Manage apparel, vinyl, accessories, and more
- **Inventory Tracking** - Real-time stock management with alerts
- **Variant System** - Handle sizes, colors, and product options
- **Bundle Deals** - Create merchandise bundles and limited editions

### 👥 Artist & Fan Features
- **Artist Profiles** - Comprehensive profiles for individuals, bands, and labels
- **Fan Engagement** - Following, reviews, comments, and social features
- **Live Streaming** - Host live concerts and studio sessions
- **Fan Funding** - Tips, donations, and crowdfunding campaigns

### 🎪 Events & Experiences
- **Concert Management** - Event creation, ticket sales, and check-in
- **Festival Tools** - Multi-stage event planning and management
- **Music Contests** - Host competitions and talent showcases

### 💰 Business Tools
- **Rights Management** - Track copyrights, licenses, and royalties
- **Analytics Dashboard** - Comprehensive insights for artists
- **Revenue Sharing** - Automated splits for bands and collaborators
- **Sync Licensing** - License music for media and commercial use

### 🔧 Advanced Features
- **AI Recommendations** - Machine learning-powered music discovery
- **Music Education** - Courses, tutorials, and certification
- **Collaboration Tools** - Remote music creation and project management
- **Publishing Admin** - Mechanical rights and performance royalties

## 🛠️ Tech Stack

- **Backend Framework:** NestJS with TypeScript
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT-based authentication
- **File Storage:** Multi-provider file upload system
- **Audio Processing:** Advanced audio processing pipeline
- **Caching:** Redis for performance optimization
- **API Documentation:** Swagger/OpenAPI integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/music-platform-backend.git
cd music-platform-backend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=music_platform

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100MB

# Audio Processing
AUDIO_QUALITY_LEVELS=128,320,lossless
```

### 4. Database Setup
```bash
# Run migrations
npm run migration:run

# Seed the database (optional)
npm run seed
```

### 5. Start the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the application is running, you can access the interactive API documentation at:
- **Swagger UI:** `http://localhost:3000/api/docs`
- **OpenAPI JSON:** `http://localhost:3000/api/docs-json`

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication & authorization
│   ├── users/             # User management
│   ├── artists/           # Artist profiles and management
│   ├── music/             # Tracks, albums, and audio processing
│   │   ├── tracks/        # Track management
│   │   ├── albums/        # Album management
│   │   ├── genres/        # Genre classification
│   │   └── playlists/     # Playlist functionality
│   ├── merchandise/       # Product and inventory management
│   ├── streaming/         # Audio streaming services
│   ├── purchases/         # Order and payment processing
│   ├── events/            # Concert and event management
│   ├── analytics/         # Platform analytics
│   ├── notifications/     # Notification system
│   └── admin/             # Administrative functions
├── common/
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Authentication guards
│   ├── interceptors/      # Request/response interceptors
│   ├── pipes/             # Validation pipes
│   └── filters/           # Exception filters
├── config/                # Configuration files
├── database/
│   ├── entities/          # TypeORM entities
│   ├── migrations/        # Database migrations
│   └── seeds/             # Database seeders
└── utils/                 # Utility functions
```

## 🔧 Development

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Operations
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Seed database
npm run seed
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## 🔐 Authentication

The platform uses JWT-based authentication with role-based access control:

### User Roles
- **Fan/User** - Basic platform access for music consumption
- **Artist** - Music upload, profile management, analytics access
- **Band** - Multi-member artist accounts with collaboration tools
- **Label** - Manage multiple artists and releases
- **Admin** - Platform administration and moderation

### Authentication Flow
1. Register/Login with email and password
2. Receive JWT token upon successful authentication
3. Include token in Authorization header: `Bearer <token>`
4. Token validates user identity and permissions

## 📊 Key Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Music Management
- `GET /tracks` - List tracks with filters
- `POST /tracks` - Upload new track
- `GET /albums/:id` - Get album details
- `POST /playlists` - Create playlist

### Merchandise
- `GET /merchandise` - Browse products
- `POST /merchandise` - Create product (artists only)
- `PUT /merchandise/:id/inventory` - Update inventory

### Streaming
- `GET /stream/:trackId` - Stream audio track
- `POST /play/:trackId` - Record play event
- `GET /charts` - Get music charts

### Events
- `GET /events` - List upcoming events
- `POST /events` - Create event (artists only)
- `POST /events/:id/tickets` - Purchase tickets

## 🎯 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## 📈 Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling for concurrent requests
- Query optimization for large music catalogs
- Partitioning for large datasets (plays, analytics)

### Caching Strategy
- Redis caching for frequently accessed data
- CDN integration for static assets
- Audio file caching for streaming optimization
- API response caching with TTL

### Audio Streaming
- Multiple quality levels (128k, 320k, lossless)
- Progressive download for improved UX
- CDN distribution for global performance
- Bandwidth adaptation based on connection

## 🔒 Security

### Data Protection
- Password hashing with bcrypt
- JWT token encryption and expiration
- Input validation and sanitization
- SQL injection prevention with TypeORM
- XSS protection with proper encoding

### API Security
- Rate limiting per endpoint
- CORS configuration
- Security headers (helmet.js)
- File upload validation and scanning
- Audio content protection (DRM ready)

## 📊 Monitoring & Analytics

### Application Monitoring
- Health check endpoints
- Performance metrics collection
- Error tracking and alerting
- Database query monitoring
- API usage analytics

### Business Analytics
- Streaming statistics
- Sales and revenue tracking
- User engagement metrics
- Artist performance insights
- Geographic and demographic data

## 🚀 Deployment

### Environment Setup
1. Set up production database
2. Configure environment variables
3. Set up file storage (AWS S3, Google Cloud, etc.)
4. Configure CDN for audio streaming
5. Set up monitoring and logging

### Deployment Options
- **Traditional Server** - PM2 process management
- **Container** - Docker with orchestration
- **Cloud Platform** - AWS, Google Cloud, Azure
- **Serverless** - AWS Lambda, Vercel, etc.

## 📄 API Versioning

The API supports versioning to maintain backward compatibility:
- Current version: `v1`
- Base URL: `https://api.musicplatform.com/v1`
- Version specified in URL path

## 🤝 Community & Support

- **Documentation:** [docs.musicplatform.com](https://docs.musicplatform.com)
- **Discord:** [Join our community](https://discord.gg/musicplatform)
- **Issues:** [GitHub Issues](https://github.com/yourusername/music-platform-backend/issues)
- **Email:** support@musicplatform.com

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- TypeORM for excellent database integration
- The open-source community for inspiration and contributions
- Musicians and artists who inspire this platform

---

**Built with ❤️ for the music community**