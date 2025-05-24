import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MerchandiseController } from "./controllers/merchandise.controller"
import { MerchandiseCategoryController } from "./controllers/merchandise-category.controller"
import { MerchandiseBundleController } from "./controllers/merchandise-bundle.controller"
import { Merchandise } from "./entities/merchandise.entity"
import { MerchandiseCategory } from "./entities/merchandise-category.entity"
import { MerchandiseVariant } from "./entities/merchandise-variant.entity"
import { MerchandiseInventory } from "./entities/merchandise-inventory.entity"
import { MerchandiseImage } from "./entities/merchandise-image.entity"
import { MerchandiseBundle } from "./entities/merchandise-bundle.entity"
import { MerchandiseBundleItem } from "./entities/merchandise-bundle-item.entity"
import { MerchandiseService } from "./providers/merchandise.service"
import { MerchandiseCategoryService } from "./providers/merchandise-category.service"
import { MerchandiseBundleService } from "./providers/merchandise-bundle.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchandise,
      MerchandiseCategory,
      MerchandiseVariant,
      MerchandiseInventory,
      MerchandiseImage,
      MerchandiseBundle,
      MerchandiseBundleItem,
    ]),
  ],
  controllers: [MerchandiseController, MerchandiseCategoryController, MerchandiseBundleController],
  providers: [MerchandiseService, MerchandiseCategoryService, MerchandiseBundleService],
  exports: [MerchandiseService, MerchandiseCategoryService, MerchandiseBundleService],
})
export class MerchandiseModule {}
