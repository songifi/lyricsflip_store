import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { Request } from "express"
import type { I18nService, LocalizationContext } from "../services/i18n.service"
import type { CurrencyService } from "../services/currency.service"
import type { LocalizationService } from "../services/localization.service"
import type { TranslationService } from "../services/translation.service"
import type { CulturePreference } from "../entities/culture-preference.entity"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"

@ApiTags("Internationalization")
@Controller("i18n")
export class I18nController {
  constructor(
    private i18nService: I18nService,
    private currencyService: CurrencyService,
    private localizationService: LocalizationService,
    private translationService: TranslationService,
  ) {}

  @Get("languages")
  @ApiOperation({ summary: "Get supported languages" })
  @ApiResponse({ status: 200, description: "List of supported languages" })
  async getSupportedLanguages() {
    return {
      languages: [
        { code: "en", name: "English", nativeName: "English" },
        { code: "es", name: "Spanish", nativeName: "Español" },
        { code: "fr", name: "French", nativeName: "Français" },
        { code: "de", name: "German", nativeName: "Deutsch" },
        { code: "it", name: "Italian", nativeName: "Italiano" },
        { code: "pt", name: "Portuguese", nativeName: "Português" },
        { code: "ja", name: "Japanese", nativeName: "日本語" },
        { code: "ko", name: "Korean", nativeName: "한국어" },
        { code: "zh", name: "Chinese", nativeName: "中文" },
        { code: "ar", name: "Arabic", nativeName: "العربية" },
        { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
        { code: "ru", name: "Russian", nativeName: "Русский" },
      ],
    }
  }

  @Get("currencies")
  @ApiOperation({ summary: "Get supported currencies" })
  @ApiResponse({ status: 200, description: "List of supported currencies" })
  async getSupportedCurrencies() {
    return {
      currencies: this.currencyService.getSupportedCurrencies(),
    }
  }

  @Get('detect-language')
  @ApiOperation({ summary: 'Detect user language from request' })
  @ApiResponse({ status: 200, description: 'Detected language' })
  async detectLanguage(@Req() request: Request) {
    const language = this.i18nService.detectLanguage(request);
    return { language };
  }

  @Get('user-preferences/:userId')
  @ApiOperation({ summary: 'Get user culture preferences' })
  @ApiResponse({ status: 200, description: 'User culture preferences' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserPreferences(@Param('userId') userId: string) {
    const preferences = await this.i18nService.getUserCulturePreference(userId);
    return { preferences };
  }

  @Put("user-preferences/:userId")
  @ApiOperation({ summary: "Update user culture preferences" })
  @ApiResponse({ status: 200, description: "Updated culture preferences" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateUserPreferences(@Param('userId') userId: string, @Body() preferences: Partial<CulturePreference>) {
    const updated = await this.i18nService.updateUserCulturePreference(userId, preferences)
    return { preferences: updated }
  }

  @Get("content/:entityType/:entityId")
  @ApiOperation({ summary: "Get localized content for entity" })
  @ApiResponse({ status: 200, description: "Localized content" })
  async getLocalizedContent(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('lang') language: string = 'en',
    @Query('region') region?: string,
  ) {
    const context: LocalizationContext = { language, region }
    const content = await this.i18nService.getLocalizedContent(entityId, entityType as any, context)
    return { content }
  }

  @Get("availability/:entityType/:entityId")
  @ApiOperation({ summary: "Check regional availability" })
  @ApiResponse({ status: 200, description: "Regional availability information" })
  async checkAvailability(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('region') region: string,
    @Query('licenseType') licenseType?: string,
  ) {
    const availability = await this.localizationService.checkRegionalAvailability(
      entityId,
      entityType,
      region,
      licenseType as any,
    )
    return { availability }
  }

  @Get("recommendations/:userId")
  @ApiOperation({ summary: "Get cultural content recommendations" })
  @ApiResponse({ status: 200, description: "Cultural recommendations" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCulturalRecommendations(
    @Param('userId') userId: string,
    @Query('entityType') entityType: string = 'track',
    @Query('limit') limit: number = 20,
  ) {
    const recommendations = await this.localizationService.getCulturalRecommendations(userId, entityType, limit)
    return { recommendations }
  }

  @Post('format-price')
  @ApiOperation({ summary: 'Format price for user locale' })
  @ApiResponse({ status: 200, description: 'Formatted price' })
  async formatPrice(
    @Body() body: { amount: number; currency: string; locale?: string },
  ) {
    const formatted = this.currencyService.formatPrice(
      body.amount,
      body.currency,
      body.locale,
    );
    return { formatted };
  }
}
