import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { I18nService as NestI18nService } from "nestjs-i18n"
import { type Translation, TranslationType } from "../entities/translation.entity"
import type { LocalizedContent, ContentType } from "../entities/localized-content.entity"
import type { CulturePreference } from "../entities/culture-preference.entity"

export interface LocalizationContext {
  language: string
  region?: string
  userId?: string
}

@Injectable()
export class I18nService {
  constructor(
    private translationRepository: Repository<Translation>,
    private localizedContentRepository: Repository<LocalizedContent>,
    private culturePreferenceRepository: Repository<CulturePreference>,
    private nestI18nService: NestI18nService,
  ) {}

  async detectLanguage(request: any): Promise<string> {
    // Priority: Query param > Header > User preference > Accept-Language > Default
    const queryLang = request.query?.lang
    const headerLang = request.headers["x-custom-lang"]
    const acceptLang = request.headers["accept-language"]

    if (queryLang && this.isValidLanguage(queryLang)) {
      return queryLang
    }

    if (headerLang && this.isValidLanguage(headerLang)) {
      return headerLang
    }

    // Parse Accept-Language header
    if (acceptLang) {
      const languages = this.parseAcceptLanguage(acceptLang)
      for (const lang of languages) {
        if (this.isValidLanguage(lang)) {
          return lang
        }
      }
    }

    return "en" // Default fallback
  }

  async getUserCulturePreference(userId: string): Promise<CulturePreference | null> {
    return this.culturePreferenceRepository.findOne({
      where: { userId },
    })
  }

  async updateUserCulturePreference(
    userId: string,
    preferences: Partial<CulturePreference>,
  ): Promise<CulturePreference> {
    const existing = await this.getUserCulturePreference(userId)

    if (existing) {
      Object.assign(existing, preferences)
      return this.culturePreferenceRepository.save(existing)
    }

    const newPreference = this.culturePreferenceRepository.create({
      userId,
      ...preferences,
    })

    return this.culturePreferenceRepository.save(newPreference)
  }

  async getTranslation(
    key: string,
    context: LocalizationContext,
    type: TranslationType = TranslationType.UI_TEXT,
    fallbackValue?: string,
  ): Promise<string> {
    // Try to get from database first
    const translation = await this.translationRepository.findOne({
      where: {
        key,
        language: context.language,
        type,
        isActive: true,
      },
    })

    if (translation) {
      return translation.value
    }

    // Fallback to nestjs-i18n
    try {
      return this.nestI18nService.translate(key, {
        lang: context.language,
      })
    } catch (error) {
      return fallbackValue || key
    }
  }

  async getLocalizedContent(
    entityId: string,
    entityType: ContentType,
    context: LocalizationContext,
  ): Promise<LocalizedContent | null> {
    return this.localizedContentRepository.findOne({
      where: {
        entityId,
        entityType,
        language: context.language,
        isActive: true,
      },
    })
  }

  async createOrUpdateLocalizedContent(
    entityId: string,
    entityType: ContentType,
    language: string,
    content: Partial<LocalizedContent>,
  ): Promise<LocalizedContent> {
    const existing = await this.localizedContentRepository.findOne({
      where: { entityId, entityType, language },
    })

    if (existing) {
      Object.assign(existing, content)
      return this.localizedContentRepository.save(existing)
    }

    const newContent = this.localizedContentRepository.create({
      entityId,
      entityType,
      language,
      ...content,
    })

    return this.localizedContentRepository.save(newContent)
  }

  private isValidLanguage(lang: string): boolean {
    const supportedLanguages = ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh", "ar", "hi", "ru"]
    return supportedLanguages.includes(lang.toLowerCase())
  }

  private parseAcceptLanguage(acceptLang: string): string[] {
    return acceptLang
      .split(",")
      .map((lang) => {
        const [language] = lang.trim().split(";")
        return language.split("-")[0] // Get primary language code
      })
      .filter(Boolean)
  }
}
