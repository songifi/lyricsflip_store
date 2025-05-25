# Internationalization Implementation Guide

## Overview

This guide provides comprehensive documentation for implementing and using the internationalization (i18n) system in our NestJS music platform.

## Features

### 1. Multi-language Support
- Support for 12 languages: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, Hindi, Russian
- Automatic language detection from headers, query parameters, and user preferences
- Fallback mechanism to ensure content is always available

### 2. Localized Content Management
- Database-driven translations for dynamic content
- Support for music metadata localization (track titles, album descriptions, artist bios)
- Namespace-based organization for different content types

### 3. Regional Licensing
- Comprehensive licensing system for different regions
- Support for multiple license types (streaming, download, sync, performance, mechanical)
- Automatic availability checking based on user location

### 4. Currency Localization
- Support for 12 major currencies
- Automatic currency detection based on user region
- Real-time price formatting with proper locale support

### 5. Cultural Content Recommendations
- User preference-based content filtering
- Cultural tag system for content categorization
- Region-specific trending and recommendations

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install nestjs-i18n
\`\`\`

### 2. Import the I18n Module

Add the I18nModule to your main AppModule:

\`\`\`typescript
import { I18nModule } from './modules/i18n/i18n.module';

@Module({
  imports: [
    // ... other modules
    I18nModule,
  ],
})
export class AppModule {}
\`\`\`

### 3. Run Database Migrations

\`\`\`bash
npm run migration:run
\`\`\`

### 4. Seed Initial Data

Create translation seeds for your base content:

\`\`\`typescript
// In your seeding script
await translationService.bulkCreateTranslations([
  {
    key: 'welcome_message',
    translations: {
      'en': 'Welcome to our music platform',
      'es': 'Bienvenido a nuestra plataforma de música',
      'fr': 'Bienvenue sur notre plateforme musicale',
    },
    type: TranslationType.UI_TEXT,
    namespace: 'common',
  },
]);
\`\`\`

## Usage Examples

### 1. Using the Localized Decorator

\`\`\`typescript
@Get('tracks')
async getTracks(@Localized() context: LocalizationContext) {
  return this.tracksService.findLocalizedTracks(context);
}
\`\`\`

### 2. Getting Translations in Services

\`\`\`typescript
const welcomeMessage = await this.i18nService.getTranslation(
  'welcome_message',
  context,
  TranslationType.UI_TEXT,
  'Welcome!' // fallback
);
\`\`\`

### 3. Checking Regional Availability

\`\`\`typescript
const availability = await this.localizationService.checkRegionalAvailability(
  trackId,
  'track',
  'US',
  LicenseType.STREAMING
);

if (!availability.isAvailable) {
  throw new ForbiddenException('Content not available in your region');
}
\`\`\`

### 4. Formatting Prices

\`\`\`typescript
const formattedPrice = this.currencyService.formatPrice(
  9.99,
  'USD',
  'en-US'
);
// Result: { amount: 9.99, currency: 'USD', formatted: '$9.99', symbol: '$' }
\`\`\`

### 5. Managing User Preferences

\`\`\`typescript
await this.i18nService.updateUserCulturePreference(userId, {
  preferredLanguage: 'es',
  region: 'ES',
  currency: 'EUR',
  timezone: 'Europe/Madrid',
  genrePreferences: ['pop', 'rock', 'flamenco'],
  culturalTags: ['spanish', 'european'],
  explicitContent: false,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
});
\`\`\`

## API Endpoints

### Language and Currency Information

- `GET /i18n/languages` - Get supported languages
- `GET /i18n/currencies` - Get supported currencies
- `GET /i18n/detect-language` - Detect user language from request

### User Preferences

- `GET /i18n/user-preferences/:userId` - Get user culture preferences
- `PUT /i18n/user-preferences/:userId` - Update user culture preferences

### Content Localization

- `GET /i18n/content/:entityType/:entityId` - Get localized content
- `GET /i18n/availability/:entityType/:entityId` - Check regional availability
- `GET /i18n/recommendations/:userId` - Get cultural recommendations

### Utility

- `POST /i18n/format-price` - Format price for user locale

## Best Practices

### 1. Translation Keys

Use descriptive, hierarchical keys:

\`\`\`typescript
// Good
'music.player.controls.play'
'user.profile.settings.language'
'error.validation.required_field'

// Bad
'play'
'lang'
'err1'
\`\`\`

### 2. Fallback Strategy

Always provide fallbacks:

\`\`\`typescript
const translation = await this.i18nService.getTranslation(
  'complex.key',
  context,
  TranslationType.UI_TEXT,
  'Default English text' // Always provide fallback
);
\`\`\`

### 3. Regional Content

Consider cultural sensitivities:

\`\`\`typescript
// Check cultural preferences before showing content
const userPrefs = await this.i18nService.getUserCulturePreference(userId);
if (!userPrefs.explicitContent) {
  // Filter explicit content
}
\`\`\`

### 4. Performance Optimization

Cache frequently used translations:

\`\`\`typescript
// Use Redis or in-memory cache for common translations
const cachedTranslation = await this.cacheService.get(`translation:${key}:${lang}`);
if (cachedTranslation) {
  return cachedTranslation;
}
\`\`\`

## Testing

### Unit Tests

\`\`\`typescript
describe('I18nService', () => {
  it('should return correct translation', async () => {
    const context = { language: 'es', region: 'ES' };
    const translation = await i18nService.getTranslation(
      'welcome_message',
      context
    );
    expect(translation).toBe('Bienvenido a nuestra plataforma de música');
  });

  it('should fallback to English when translation not found', async () => {
    const context = { language: 'unknown' };
    const translation = await i18nService.getTranslation(
      'welcome_message',
      context,
      TranslationType.UI_TEXT,
      'Welcome!'
    );
    expect(translation).toBe('Welcome!');
  });
});
\`\`\`

### Integration Tests

\`\`\`typescript
describe('I18n API', () => {
  it('should return localized content', async () => {
    const response = await request(app.getHttpServer())
      .get('/i18n/content/track/123')
      .query({ lang: 'es', region: 'ES' })
      .expect(200);

    expect(response.body.content.title).toBeDefined();
    expect(response.body._localization.language).toBe('es');
  });
});
\`\`\`

## Monitoring and Analytics

### Translation Coverage

Monitor translation coverage across languages:

\`\`\`typescript
// Add to your analytics service
async getTranslationCoverage(language: string): Promise<number> {
  const totalKeys = await this.translationRepository.count({
    where: { language: 'en' } // Base language
  });
  
  const translatedKeys = await this.translationRepository.count({
    where: { language, isActive: true }
  });
  
  return (translatedKeys / totalKeys) * 100;
}
\`\`\`

### Regional Usage

Track content availability by region:

\`\`\`typescript
// Analytics for regional licensing
async getRegionalAvailabilityStats(): Promise<any> {
  return this.regionalLicenseRepository
    .createQueryBuilder('license')
    .select('license.region, COUNT(*) as available_content')
    .where('license.status = :status', { status: 'active' })
    .groupBy('license.region')
    .getRawMany();
}
\`\`\`

## Troubleshooting

### Common Issues

1. **Missing Translations**: Always provide fallbacks and monitor translation coverage
2. **Regional Restrictions**: Implement proper error handling for geo-blocked content
3. **Currency Conversion**: Use reliable exchange rate APIs and cache rates appropriately
4. **Performance**: Cache translations and use database indexes effectively

### Debug Mode

Enable debug logging for i18n operations:

\`\`\`typescript
// In your configuration
{
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  // Add i18n specific logging
}
\`\`\`

## Migration Guide

### From Existing System

1. Export existing translations to JSON format
2. Use the import functionality to bulk load translations
3. Update your services to use the new i18n system
4. Test thoroughly with different language/region combinations

### Adding New Languages

1. Add language to supported languages list
2. Create translation files in `/src/i18n/{language}/`
3. Import base translations using the bulk import API
4. Update frontend language selector

## Security Considerations

### Input Validation

Always validate language and region codes:

\`\`\`typescript
private isValidLanguage(lang: string): boolean {
  const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'ru'];
  return supportedLanguages.includes(lang.toLowerCase());
}
\`\`\`

### Content Sanitization

Sanitize user-generated translations:

\`\`\`typescript
import { sanitize } from 'dompurify';

async createTranslation(key: string, language: string, value: string) {
  const sanitizedValue = sanitize(value);
  // ... save sanitized value
}
\`\`\`

## Conclusion

This i18n implementation provides a robust foundation for global music platform operations. It handles the complexity of multi-language support, regional licensing, currency localization, and cultural preferences while maintaining performance and scalability.

For additional support or questions, please refer to the API documentation or contact the development team.
