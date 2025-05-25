import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryItem } from "../../../database/entities/inventory-item.entity"
import { Supplier } from "../../../database/entities/supplier.entity"
import { InventoryBatch } from "../../../database/entities/inventory-batch.entity"
import { InventoryAudit } from "../../../database/entities/inventory-audit.entity"
import { PurchaseOrder } from "../../../database/entities/purchase-order.entity"
import { PurchaseOrderItem } from "../../../database/entities/purchase-order-item.entity"
import { InventoryForecast } from "../../../database/entities/inventory-forecast.entity"
import { InventoryService } from "./services/inventory.service"
import { SupplierService } from "./services/supplier.service"
import { BatchService } from "./services/batch.service"
import { PurchaseOrderService } from "./services/purchase-order.service"
import { ForecastService } from "./services/forecast.service"
import { InventoryController } from "./controllers/inventory.controller"
import { SupplierController } from "./controllers/supplier.controller"
import { BatchController } from "./controllers/batch.controller"
import { PurchaseOrderController } from "./controllers/purchase-order.controller"
import { ForecastController } from "./controllers/forecast.controller"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem,
      Supplier,
      InventoryBatch,
      InventoryAudit,
      PurchaseOrder,
      PurchaseOrderItem,
      InventoryForecast,
    ]),
  ],
  controllers: [InventoryController, SupplierController, BatchController, PurchaseOrderController, ForecastController],
  providers: [InventoryService, SupplierService, BatchService, PurchaseOrderService, ForecastService],
  exports: [InventoryService, SupplierService, BatchService, PurchaseOrderService, ForecastService],
})
export class InventoryModule {}
