import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Translation, TranslationType } from "../entities/translation.entity"

export interface BulkTranslationData {
  key: string
  translations: Record<string, string> // language -> value
  type: TranslationType
  namespace?: string
  metadata?: Record<string, any>
}

@Injectable()
export class TranslationService {
  constructor(
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
  ) {}

  async createTranslation(
    key: string,
    language: string,
    value: string,
    type: TranslationType = TranslationType.UI_TEXT,
    namespace?: string,
    metadata?: Record<string, any>,
  ): Promise<Translation> {
    const translation = this.translationRepository.create({
      key,
      language,
      value,
      type,
      namespace,
      metadata,
    })

    return this.translationRepository.save(translation)
  }

  async updateTranslation(
    key: string,
    language: string,
    value: string,
    type: TranslationType = TranslationType.UI_TEXT,
  ): Promise<Translation> {
    const existing = await this.translationRepository.findOne({
      where: { key, language, type },
    })

    if (existing) {
      existing.value = value
      return this.translationRepository.save(existing)
    }

    return this.createTranslation(key, language, value, type)
  }

  async bulkCreateTranslations(translationsData: BulkTranslationData[]): Promise<Translation[]> {
    const translations: Translation[] = []

    for (const data of translationsData) {
      for (const [language, value] of Object.entries(data.translations)) {
        const translation = this.translationRepository.create({
          key: data.key,
          language,
          value,
          type: data.type,
          namespace: data.namespace,
          metadata: data.metadata,
        })
        translations.push(translation)
      }
    }

    return this.translationRepository.save(translations)
  }

  async getTranslationsByNamespace(namespace: string, language: string): Promise<Record<string, string>> {
    const translations = await this.translationRepository.find({
      where: { namespace, language, isActive: true },
    })

    return translations.reduce(
      (acc, translation) => {
        acc[translation.key] = translation.value
        return acc
      },
      {} as Record<string, string>,
    )
  }

  async getTranslationsByType(type: TranslationType, language: string): Promise<Translation[]> {
    return this.translationRepository.find({
      where: { type, language, isActive: true },
      order: { key: "ASC" },
    })
  }

  async deleteTranslation(key: string, language: string, type: TranslationType): Promise<void> {
    await this.translationRepository.delete({ key, language, type })
  }

  async searchTranslations(searchTerm: string, language?: string, type?: TranslationType): Promise<Translation[]> {
    const queryBuilder = this.translationRepository.createQueryBuilder("translation")

    queryBuilder.where("(translation.key ILIKE :searchTerm OR translation.value ILIKE :searchTerm)", {
      searchTerm: `%${searchTerm}%`,
    })

    if (language) {
      queryBuilder.andWhere("translation.language = :language", { language })
    }

    if (type) {
      queryBuilder.andWhere("translation.type = :type", { type })
    }

    queryBuilder.andWhere("translation.isActive = :isActive", { isActive: true })
    queryBuilder.orderBy("translation.key", "ASC")

    return queryBuilder.getMany()
  }

  async exportTranslations(
    language: string,
    type?: TranslationType,
    namespace?: string,
  ): Promise<Record<string, string>> {
    const whereCondition: any = { language, isActive: true }

    if (type) {
      whereCondition.type = type
    }

    if (namespace) {
      whereCondition.namespace = namespace
    }

    const translations = await this.translationRepository.find({
      where: whereCondition,
      order: { key: "ASC" },
    })

    return translations.reduce(
      (acc, translation) => {
        acc[translation.key] = translation.value
        return acc
      },
      {} as Record<string, string>,
    )
  }

  async importTranslations(
    language: string,
    translations: Record<string, string>,
    type: TranslationType = TranslationType.UI_TEXT,
    namespace?: string,
    overwrite = false,
  ): Promise<number> {
    let importedCount = 0

    for (const [key, value] of Object.entries(translations)) {
      const existing = await this.translationRepository.findOne({
        where: { key, language, type },
      })

      if (!existing || overwrite) {
        if (existing && overwrite) {
          existing.value = value
          existing.namespace = namespace
          await this.translationRepository.save(existing)
        } else {
          await this.createTranslation(key, language, value, type, namespace)
        }
        importedCount++
      }
    }

    return importedCount
  }
}
