import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { InventoryService } from "./inventory.service"
import type { BatchService } from "./batch.service"
import type { PurchaseOrderService } from "./purchase-order.service"

export interface AlertConfig {
  lowStockEnabled: boolean
  expiryWarningDays: number
  reorderSuggestionEnabled: boolean
  emailNotifications: boolean
  webhookUrl?: string
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name)

  constructor(
    private inventoryService: InventoryService,
    private batchService: BatchService,
    private purchaseOrderService: PurchaseOrderService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkLowStockAlerts() {
    this.logger.log("Running low stock alert check...")

    try {
      const lowStockItems = await this.inventoryService.getLowStockItems()

      if (lowStockItems.length > 0) {
        const alert = {
          type: "LOW_STOCK",
          severity: "HIGH",
          message: `${lowStockItems.length} items are below reorder point`,
          items: lowStockItems.map((item) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            currentStock: item.currentStock,
            reorderPoint: item.reorderPoint,
            supplier: item.supplier?.name,
          })),
          timestamp: new Date(),
        }

        await this.sendAlert(alert)
        this.logger.warn(`Low stock alert: ${lowStockItems.length} items need attention`)
      }
    } catch (error) {
      this.logger.error("Failed to check low stock alerts", error)
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkExpiryAlerts() {
    this.logger.log("Running expiry alert check...")

    try {
      const expiringBatches = await this.batchService.getExpiringBatches(30)

      if (expiringBatches.length > 0) {
        const alert = {
          type: "EXPIRY_WARNING",
          severity: "MEDIUM",
          message: `${expiringBatches.length} batches expiring within 30 days`,
          batches: expiringBatches.map((batch) => ({
            id: batch.id,
            batchNumber: batch.batchNumber,
            itemName: batch.inventoryItem.name,
            expiryDate: batch.expiryDate,
            quantity: batch.availableQuantity,
          })),
          timestamp: new Date(),
        }

        await this.sendAlert(alert)
        this.logger.warn(`Expiry alert: ${expiringBatches.length} batches expiring soon`)
      }
    } catch (error) {
      this.logger.error("Failed to check expiry alerts", error)
    }
  }

  @Cron(CronExpression.EVERY_MONDAY_AT_8AM)
  async generateReorderSuggestions() {
    this.logger.log("Generating reorder suggestions...")

    try {
      const suggestions = await this.purchaseOrderService.generateReorderSuggestions()

      if (suggestions.length > 0) {
        const alert = {
          type: "REORDER_SUGGESTION",
          severity: "LOW",
          message: `${suggestions.length} items recommended for reordering`,
          suggestions: suggestions.map((suggestion) => ({
            item: suggestion.inventoryItem,
            suggestedQuantity: suggestion.suggestedQuantity,
            supplier: suggestion.preferredSupplier,
          })),
          timestamp: new Date(),
        }

        await this.sendAlert(alert)
        this.logger.log(`Generated ${suggestions.length} reorder suggestions`)
      }
    } catch (error) {
      this.logger.error("Failed to generate reorder suggestions", error)
    }
  }

  private async sendAlert(alert: any) {
    // In a real implementation, you would:
    // 1. Save alert to database
    // 2. Send email notifications
    // 3. Send webhook notifications
    // 4. Push to notification service

    this.logger.log(`Alert generated: ${alert.type} - ${alert.message}`)

    // Example webhook notification
    if (process.env.INVENTORY_WEBHOOK_URL) {
      try {
        // await this.httpService.post(process.env.INVENTORY_WEBHOOK_URL, alert).toPromise();
        this.logger.log("Alert sent to webhook")
      } catch (error) {
        this.logger.error("Failed to send webhook alert", error)
      }
    }
  }

  async getAlertHistory(days = 30): Promise<any[]> {
    // This would typically fetch from a database
    // For now, return empty array
    return []
  }

  async updateAlertConfig(config: AlertConfig): Promise<void> {
    // This would typically save to database or configuration service
    this.logger.log("Alert configuration updated", config)
  }
}
