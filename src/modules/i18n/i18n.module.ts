import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { I18nModule as NestI18nModule, HeaderResolver, QueryResolver, AcceptLanguageResolver } from "nestjs-i18n"
import { join } from "path"
import { I18nService } from "./services/i18n.service"
import { TranslationService } from "./services/translation.service"
import { LocalizationService } from "./services/localization.service"
import { CurrencyService } from "./services/currency.service"
import { Translation } from "./entities/translation.entity"
import { LocalizedContent } from "./entities/localized-content.entity"
import { RegionalLicense } from "./entities/regional-license.entity"
import { CulturePreference } from "./entities/culture-preference.entity"
import { I18nController } from "./controllers/i18n.controller"

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Translation, LocalizedContent, RegionalLicense, CulturePreference]),
    NestI18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: join(__dirname, "../../i18n/"),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        { use: HeaderResolver, options: ["x-custom-lang"] },
        AcceptLanguageResolver,
      ],
      typesOutputPath: join(__dirname, "../../generated/i18n.generated.ts"),
    }),
  ],
  providers: [I18nService, TranslationService, LocalizationService, CurrencyService],
  controllers: [I18nController],
  exports: [I18nService, TranslationService, LocalizationService, CurrencyService],
})
export class I18nModule {}
