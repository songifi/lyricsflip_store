import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { InventoryForecast } from "../../../../database/entities/inventory-forecast.entity"
import { type InventoryAudit, AuditType } from "../../../../database/entities/inventory-audit.entity"
import type { InventoryItem } from "../../../../database/entities/inventory-item.entity"

@Injectable()
export class ForecastService {
  constructor(
    private forecastRepository: Repository<InventoryForecast>,
    private auditRepository: Repository<InventoryAudit>,
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async generateForecast(inventoryItemId: string, days = 30): Promise<InventoryForecast> {
    // Get historical sales data
    const historicalData = await this.getHistoricalSalesData(inventoryItemId, 90) // 90 days of history

    // Simple moving average forecast (in production, you'd use more sophisticated algorithms)
    const avgDailySales = this.calculateMovingAverage(historicalData)
    const predictedDemand = Math.round(avgDailySales * days)

    // Calculate recommended stock (demand + safety stock)
    const safetyStockMultiplier = 1.5 // 50% safety stock
    const recommendedStock = Math.round(predictedDemand * safetyStockMultiplier)

    // Calculate confidence level based on data consistency
    const confidenceLevel = this.calculateConfidenceLevel(historicalData)

    const forecastDate = new Date()
    forecastDate.setDate(forecastDate.getDate() + days)

    const forecast = this.forecastRepository.create({
      inventoryItemId,
      forecastDate,
      predictedDemand,
      recommendedStock,
      confidenceLevel,
      factors: {
        historicalPeriod: 90,
        avgDailySales,
        safetyStockMultiplier,
        dataPoints: historicalData.length,
      },
    })

    return this.forecastRepository.save(forecast)
  }

  async getForecastsForItem(inventoryItemId: string): Promise<InventoryForecast[]> {
    return this.forecastRepository.find({
      where: { inventoryItemId },
      order: { createdAt: "DESC" },
      take: 10,
    })
  }

  async generateForecastsForAllItems(): Promise<void> {
    const activeItems = await this.inventoryRepository.find({
      where: { status: "active" },
    })

    for (const item of activeItems) {
      try {
        await this.generateForecast(item.id)
      } catch (error) {
        console.error(`Failed to generate forecast for item ${item.sku}:`, error)
      }
    }
  }

  private async getHistoricalSalesData(inventoryItemId: string, days: number): Promise<number[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const salesData = await this.auditRepository
      .createQueryBuilder("audit")
      .select("DATE(audit.createdAt)", "date")
      .addSelect("SUM(ABS(audit.quantityChanged))", "dailySales")
      .where("audit.inventoryItemId = :inventoryItemId", { inventoryItemId })
      .andWhere("audit.type = :type", { type: AuditType.STOCK_OUT })
      .andWhere("audit.createdAt >= :startDate", { startDate })
      .groupBy("DATE(audit.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany()

    return salesData.map((data) => Number.parseFloat(data.dailySales) || 0)
  }

  private calculateMovingAverage(data: number[]): number {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, val) => acc + val, 0)
    return sum / data.length
  }

  private calculateConfidenceLevel(data: number[]): number {
    if (data.length < 7) return 0.3 // Low confidence with insufficient data

    const mean = this.calculateMovingAverage(data)
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length
    const standardDeviation = Math.sqrt(variance)

    // Lower standard deviation relative to mean = higher confidence
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1
    const confidence = Math.max(0.1, Math.min(0.95, 1 - coefficientOfVariation))

    return Math.round(confidence * 100) / 100
  }

  async getInventoryOptimizationSuggestions(): Promise<
    Array<{
      item: InventoryItem
      suggestion: string
      priority: "high" | "medium" | "low"
      action: string
    }>
  > {
    const items = await this.inventoryRepository.find({
      where: { status: "active" },
      relations: ["supplier"],
    })

    const suggestions = []

    for (const item of items) {
      const latestForecast = await this.forecastRepository.findOne({
        where: { inventoryItemId: item.id },
        order: { createdAt: "DESC" },
      })

      if (!latestForecast) continue

      // Overstock suggestion
      if (item.currentStock > latestForecast.recommendedStock * 1.5) {
        suggestions.push({
          item,
          suggestion: `Overstock detected. Current: ${item.currentStock}, Recommended: ${latestForecast.recommendedStock}`,
          priority: "medium" as const,
          action: "Consider promotional pricing or redistribution",
        })
      }

      // Understock suggestion
      if (item.currentStock < latestForecast.recommendedStock * 0.5) {
        suggestions.push({
          item,
          suggestion: `Understock risk. Current: ${item.currentStock}, Recommended: ${latestForecast.recommendedStock}`,
          priority: "high" as const,
          action: "Immediate reorder recommended",
        })
      }

      // Reorder point optimization
      const turnover = await this.calculateTurnoverRate(item.id)
      if (turnover > 12 && item.reorderPoint < item.maximumStock * 0.3) {
        // High turnover
        suggestions.push({
          item,
          suggestion: `High turnover item may need higher reorder point`,
          priority: "medium" as const,
          action: `Consider increasing reorder point to ${Math.round(item.maximumStock * 0.4)}`,
        })
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private async calculateTurnoverRate(inventoryItemId: string): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const salesData = await this.auditRepository
      .createQueryBuilder("audit")
      .select("SUM(ABS(audit.quantityChanged))", "totalSold")
      .where("audit.inventoryItemId = :inventoryItemId", { inventoryItemId })
      .andWhere("audit.type = :type", { type: AuditType.STOCK_OUT })
      .andWhere("audit.createdAt >= :startDate", { startDate: thirtyDaysAgo })
      .getRawOne()

    const totalSold = Number.parseFloat(salesData.totalSold) || 0
    return (totalSold / 30) * 365 // Annualized turnover
  }
}
