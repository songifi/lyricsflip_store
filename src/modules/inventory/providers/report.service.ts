import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { Repository } from "typeorm"
import type { InventoryItem } from "../../../../database/entities/inventory-item.entity"
import { type InventoryAudit, AuditType } from "../../../../database/entities/inventory-audit.entity"
import type { PurchaseOrder } from "../../../../database/entities/purchase-order.entity"

export interface InventoryReport {
  reportType: string
  generatedAt: Date
  period: {
    startDate: Date
    endDate: Date
  }
  data: any
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name)

  constructor(
    private inventoryRepository: Repository<InventoryItem>,
    private auditRepository: Repository<InventoryAudit>,
    private purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlyInventoryReport() {
    this.logger.log("Generating monthly inventory report...")

    const endDate = new Date()
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)

    const report = await this.generateInventoryMovementReport(startDate, endDate)

    // Save or send report
    await this.saveReport(report)
    this.logger.log("Monthly inventory report generated")
  }

  @Cron(CronExpression.EVERY_SUNDAY_AT_MIDNIGHT)
  async generateWeeklyStockReport() {
    this.logger.log("Generating weekly stock report...")

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    const report = await this.generateStockLevelReport(startDate, endDate)

    await this.saveReport(report)
    this.logger.log("Weekly stock report generated")
  }

  async generateInventoryMovementReport(startDate: Date, endDate: Date): Promise<InventoryReport> {
    const movements = await this.auditRepository
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.inventoryItem", "item")
      .where("audit.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .orderBy("audit.createdAt", "DESC")
      .getMany()

    const summary = {
      totalMovements: movements.length,
      stockIn: movements.filter((m) => m.quantityChanged > 0).length,
      stockOut: movements.filter((m) => m.quantityChanged < 0).length,
      adjustments: movements.filter((m) => m.type === AuditType.ADJUSTMENT).length,
      byCategory: {},
      byType: {},
    }

    // Group by category
    movements.forEach((movement) => {
      const category = movement.inventoryItem.category
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = { in: 0, out: 0, net: 0 }
      }

      if (movement.quantityChanged > 0) {
        summary.byCategory[category].in += movement.quantityChanged
      } else {
        summary.byCategory[category].out += Math.abs(movement.quantityChanged)
      }
      summary.byCategory[category].net += movement.quantityChanged
    })

    // Group by type
    movements.forEach((movement) => {
      if (!summary.byType[movement.type]) {
        summary.byType[movement.type] = 0
      }
      summary.byType[movement.type]++
    })

    return {
      reportType: "INVENTORY_MOVEMENT",
      generatedAt: new Date(),
      period: { startDate, endDate },
      data: {
        summary,
        movements: movements.slice(0, 100), // Limit for performance
      },
    }
  }

  async generateStockLevelReport(startDate: Date, endDate: Date): Promise<InventoryReport> {
    const items = await this.inventoryRepository.find({
      relations: ["supplier"],
      where: { status: "active" },
    })

    const stockValue = await this.inventoryRepository
      .createQueryBuilder("item")
      .select("SUM(item.currentStock * item.costPrice)", "totalValue")
      .where("item.status = :status", { status: "active" })
      .getRawOne()

    const lowStockItems = items.filter((item) => item.currentStock <= item.reorderPoint)
    const overstockItems = items.filter((item) => item.currentStock > item.maximumStock)
    const outOfStockItems = items.filter((item) => item.currentStock === 0)

    const categoryBreakdown = {}
    items.forEach((item) => {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = {
          itemCount: 0,
          totalValue: 0,
          totalStock: 0,
          lowStockCount: 0,
        }
      }

      categoryBreakdown[item.category].itemCount++
      categoryBreakdown[item.category].totalValue += item.currentStock * item.costPrice
      categoryBreakdown[item.category].totalStock += item.currentStock

      if (item.currentStock <= item.reorderPoint) {
        categoryBreakdown[item.category].lowStockCount++
      }
    })

    return {
      reportType: "STOCK_LEVEL",
      generatedAt: new Date(),
      period: { startDate, endDate },
      data: {
        summary: {
          totalItems: items.length,
          totalStockValue: Number.parseFloat(stockValue.totalValue) || 0,
          lowStockItems: lowStockItems.length,
          overstockItems: overstockItems.length,
          outOfStockItems: outOfStockItems.length,
        },
        categoryBreakdown,
        alerts: {
          lowStock: lowStockItems.map((item) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            currentStock: item.currentStock,
            reorderPoint: item.reorderPoint,
          })),
          overstock: overstockItems.map((item) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            currentStock: item.currentStock,
            maximumStock: item.maximumStock,
          })),
        },
      },
    }
  }

  async generateSupplierPerformanceReport(startDate: Date, endDate: Date): Promise<InventoryReport> {
    const orders = await this.purchaseOrderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.supplier", "supplier")
      .where("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .getMany()

    const supplierStats = {}

    orders.forEach((order) => {
      const supplierId = order.supplier.id
      if (!supplierStats[supplierId]) {
        supplierStats[supplierId] = {
          supplier: order.supplier,
          totalOrders: 0,
          totalValue: 0,
          onTimeDeliveries: 0,
          lateDeliveries: 0,
          averageDeliveryTime: 0,
          deliveryTimes: [],
        }
      }

      const stats = supplierStats[supplierId]
      stats.totalOrders++
      stats.totalValue += order.totalAmount

      if (order.actualDeliveryDate && order.expectedDeliveryDate) {
        const deliveryTime = order.actualDeliveryDate.getTime() - order.orderDate.getTime()
        stats.deliveryTimes.push(deliveryTime)

        if (order.actualDeliveryDate <= order.expectedDeliveryDate) {
          stats.onTimeDeliveries++
        } else {
          stats.lateDeliveries++
        }
      }
    })

    // Calculate average delivery times
    Object.values(supplierStats).forEach((stats: any) => {
      if (stats.deliveryTimes.length > 0) {
        const avgTime = stats.deliveryTimes.reduce((sum, time) => sum + time, 0) / stats.deliveryTimes.length
        stats.averageDeliveryTime = Math.round(avgTime / (1000 * 60 * 60 * 24)) // Convert to days
      }
      delete stats.deliveryTimes // Remove raw data
    })

    return {
      reportType: "SUPPLIER_PERFORMANCE",
      generatedAt: new Date(),
      period: { startDate, endDate },
      data: {
        summary: {
          totalSuppliers: Object.keys(supplierStats).length,
          totalOrders: orders.length,
          totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        },
        supplierStats: Object.values(supplierStats),
      },
    }
  }

  async generateABCAnalysisReport(): Promise<InventoryReport> {
    const items = await this.inventoryRepository.find({
      where: { status: "active" },
    })

    // Calculate annual consumption value for each item
    const itemAnalysis = await Promise.all(
      items.map(async (item) => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const consumption = await this.auditRepository
          .createQueryBuilder("audit")
          .select("SUM(ABS(audit.quantityChanged))", "totalConsumed")
          .where("audit.inventoryItemId = :itemId", { itemId: item.id })
          .andWhere("audit.type = :type", { type: AuditType.STOCK_OUT })
          .andWhere("audit.createdAt >= :startDate", { startDate: thirtyDaysAgo })
          .getRawOne()

        const monthlyConsumption = Number.parseFloat(consumption.totalConsumed) || 0
        const annualConsumption = monthlyConsumption * 12
        const annualValue = annualConsumption * item.unitPrice

        return {
          item,
          annualConsumption,
          annualValue,
          currentStockValue: item.currentStock * item.costPrice,
        }
      }),
    )

    // Sort by annual value (descending)
    itemAnalysis.sort((a, b) => b.annualValue - a.annualValue)

    const totalValue = itemAnalysis.reduce((sum, analysis) => sum + analysis.annualValue, 0)
    let cumulativeValue = 0

    // Classify items into A, B, C categories
    const classifiedItems = itemAnalysis.map((analysis) => {
      cumulativeValue += analysis.annualValue
      const cumulativePercentage = (cumulativeValue / totalValue) * 100

      let category
      if (cumulativePercentage <= 80) {
        category = "A"
      } else if (cumulativePercentage <= 95) {
        category = "B"
      } else {
        category = "C"
      }

      return {
        ...analysis,
        category,
        cumulativePercentage,
      }
    })

    const categoryStats = {
      A: classifiedItems.filter((item) => item.category === "A"),
      B: classifiedItems.filter((item) => item.category === "B"),
      C: classifiedItems.filter((item) => item.category === "C"),
    }

    return {
      reportType: "ABC_ANALYSIS",
      generatedAt: new Date(),
      period: {
        startDate: new Date(new Date().setDate(new Date().getDate() - 365)),
        endDate: new Date(),
      },
      data: {
        summary: {
          totalItems: itemAnalysis.length,
          totalAnnualValue: totalValue,
          categoryA: {
            count: categoryStats.A.length,
            percentage: (categoryStats.A.length / itemAnalysis.length) * 100,
          },
          categoryB: {
            count: categoryStats.B.length,
            percentage: (categoryStats.B.length / itemAnalysis.length) * 100,
          },
          categoryC: {
            count: categoryStats.C.length,
            percentage: (categoryStats.C.length / itemAnalysis.length) * 100,
          },
        },
        items: classifiedItems,
      },
    }
  }

  private async saveReport(report: InventoryReport): Promise<void> {
    // In a real implementation, you would save to database or file system
    this.logger.log(
      `Report saved: ${report.reportType} for period ${report.period.startDate} to ${report.period.endDate}`,
    )

    // Example: Save to file system
    // const filename = `${report.reportType}_${report.generatedAt.toISOString().split('T')[0]}.json`;
    // await fs.writeFile(path.join('reports', filename), JSON.stringify(report, null, 2));
  }

  async getReportHistory(reportType?: string, limit = 10): Promise<InventoryReport[]> {
    // This would typically fetch from database
    // For now, return empty array
    return []
  }
}
