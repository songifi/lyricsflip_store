// src/services/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Purchase, PurchaseStatus } from '../entities/purchase.entity';
import { PurchaseItem, ItemType } from '../entities/purchase-item.entity';
import { DigitalDownload } from '../entities/digital-download.entity';

export interface SalesMetrics {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    itemId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByCategory: Record<ItemType, {
    sales: number;
    revenue: number;
  }>;
  salesByPeriod: Array<{
    period: string;
    sales: number;
    revenue: number;
  }>;
  downloadMetrics: {
    totalDownloads: number;
    uniqueDownloaders: number;
    averageDownloadsPerPurchase: number;
  };
}

export interface ArtistAnalytics {
  artistId: string;
  artistName: string;
  totalRevenue: number;
  totalSales: number;
  totalDownloads: number;
  topTracks: Array<{
    trackId: string;
    trackName: string;
    sales: number;
    revenue: number;
    downloads: number;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    sales: number;
    revenue: number;
  }>;
  customerMetrics: {
    totalCustomers: number;
    returningCustomers: number;
    averageCustomerValue: number;
  };
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
    @InjectRepository(DigitalDownload)
    private digitalDownloadRepository: Repository<DigitalDownload>,
  ) {}

  async recordPurchase(purchase: Purchase): Promise<void> {
    // This could trigger additional analytics events
    // such as updating real-time dashboards, sending to analytics services, etc.
    this.logger.log(`Recording purchase analytics for order: ${purchase.orderNumber}`);
    
    // In a real implementation, you might send events to analytics services like:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics service
    // - Real-time dashboard updates
  }

  async getGlobalSalesMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<SalesMetrics> {
    const purchases = await this.purchaseRepository.find({
      where: {
        status: PurchaseStatus.COMPLETED,
        createdAt: Between(startDate, endDate),
      },
      relations: ['items'],
    });

    const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.total), 0);
    const totalSales = purchases.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate top selling items
    const itemSales = new Map<string, {
      itemId: string;
      name: string;
      sales: number;
      revenue: number;
    }>();

    const categorySales = Object.values(ItemType).reduce((acc, type) => {
      acc[type] = { sales: 0, revenue: 0 };
      return acc;
    }, {} as Record<ItemType, { sales: number; revenue: number }>);

    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        const key = item.itemId;
        if (!itemSales.has(key)) {
          itemSales.set(key, {
            itemId: item.itemId,
            name: item.name,
            sales: 0,
            revenue: 0,
          });
        }
        
        const itemData = itemSales.get(key)!;
        itemData.sales += item.quantity;
        itemData.revenue += Number(item.totalPrice);

        // Category sales
        categorySales[item.itemType].sales += item.quantity;
        categorySales[item.itemType].revenue += Number(item.totalPrice);
      });
    });

    const topSellingItems = Array.from(itemSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // Sales by period (daily for the given range)
    const salesByPeriod = this.groupSalesByPeriod(purchases, 'day');

    // Download metrics
    const downloadMetrics = await this.getDownloadMetrics(startDate, endDate);

    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      topSellingItems,
      salesByCategory: categorySales,
      salesByPeriod,
      downloadMetrics,
    };
  }

  async getArtistAnalytics(
    artistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ArtistAnalytics> {
    // Get purchases containing items from this artist
    const purchases = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.items', 'item')
      .leftJoinAndSelect('purchase.buyer', 'buyer')
      .where('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
      .andWhere('purchase.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('item.itemId IN (SELECT id FROM songs WHERE artist_id = :artistId)', {
        artistId,
      })
      .getMany();

    const artistItems = purchases.flatMap(p => 
      p.items.filter(item => this.isArtistItem(item, artistId))
    );

    const totalRevenue = artistItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    const totalSales = artistItems.reduce((sum, item) => sum + item.quantity, 0);

    // Top tracks
    const trackSales = new Map<string, {
      trackId: string;
      trackName: string;
      sales: number;
      revenue: number;
      downloads: number;
    }>();

    for (const item of artistItems) {
      if (!trackSales.has(item.itemId)) {
        const downloads = await this.getItemDownloadCount(item.itemId);
        trackSales.set(item.itemId, {
          trackId: item.itemId,
          trackName: item.name,
          sales: 0,
          revenue: 0,
          downloads,
        });
      }
      
      const track = trackSales.get(item.itemId)!;
      track.sales += item.quantity;
      track.revenue += Number(item.totalPrice);
    }

    const topTracks = Array.from(trackSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // Sales trend
    const salesTrend = this.groupArtistSalesByPeriod(purchases, artistId, 'day');

    // Geographic distribution
    const geographicDistribution = await this.getGeographicDistribution(purchases);

    // Customer metrics
    const customerMetrics = await this.getCustomerMetrics(purchases);

    // Total downloads for artist
    const totalDownloads = await this.getArtistDownloadCount(artistId);

    return {
      artistId,
      artistName: await this.getArtistName(artistId),
      totalRevenue,
      totalSales,
      totalDownloads,
      topTracks,
      salesTrend,
      geographicDistribution,
      customerMetrics,
    };
  }

  async getRevenueByTimeframe(
    timeframe: 'day' | 'week' | 'month' | 'year',
    limit = 30,
  ): Promise<Array<{ period: string; revenue: number; sales: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(endDate.getDate() - limit);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - (limit * 7));
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - limit);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - limit);
        break;
    }

    const purchases = await this.purchaseRepository.find({
      where: {
        status: PurchaseStatus.COMPLETED,
        createdAt: Between(startDate, endDate),
      },
    });

    return this.groupSalesByPeriod(purchases, timeframe);
  }

  async getTopSellingItems(
    limit = 10,
    timeframe?: { start: Date; end: Date },
  ): Promise<Array<{
    itemId: string;
    name: string;
    itemType: ItemType;
    sales: number;
    revenue: number;
  }>> {
    let query = this.purchaseItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.purchase', 'purchase')
      .where('purchase.status = :status', { status: PurchaseStatus.COMPLETED });

    if (timeframe) {
      query = query.andWhere('purchase.createdAt BETWEEN :start AND :end', {
        start: timeframe.start,
        end: timeframe.end,
      });
    }

    const items = await query.getMany();

    const itemMap = new Map<string, {
      itemId: string;
      name: string;
      itemType: ItemType;
      sales: number;
      revenue: number;
    }>();

    items.forEach(item => {
      const key = item.itemId;
      if (!itemMap.has(key)) {
        itemMap.set(key, {
          itemId: item.itemId,
          name: item.name,
          itemType: item.itemType,
          sales: 0,
          revenue: 0,
        });
      }
      
      const data = itemMap.get(key)!;
      data.sales += item.quantity;
      data.revenue += Number(item.totalPrice);
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  private async getDownloadMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalDownloads: number;
    uniqueDownloaders: number;
    averageDownloadsPerPurchase: number;
  }> {
    const downloads = await this.digitalDownloadRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const totalDownloads = downloads.reduce((sum, d) => sum + d.downloadCount, 0);
    const uniqueDownloaders = new Set(downloads.map(d => d.userId)).size;
    
    const purchasesWithDownloads = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.items', 'item')
      .leftJoin('item.digitalDownloads', 'download')
      .where('purchase.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('download.id IS NOT NULL')
      .getCount();

    const averageDownloadsPerPurchase = purchasesWithDownloads > 0 
      ? totalDownloads / purchasesWithDownloads 
      : 0;

    return {
      totalDownloads,
      uniqueDownloaders,
      averageDownloadsPerPurchase,
    };
  }

  private groupSalesByPeriod(
    purchases: Purchase[],
    period: 'day' | 'week' | 'month' | 'year',
  ): Array<{ period: string; sales: number; revenue: number }> {
    const groups = new Map<string, { sales: number; revenue: number }>();

    purchases.forEach(purchase => {
      const date = new Date(purchase.createdAt);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, { sales: 0, revenue: 0 });
      }

      const group = groups.get(key)!;
      group.sales += 1;
      group.revenue += Number(purchase.total);
    });

    return Array.from(groups.entries())
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private groupArtistSalesByPeriod(
    purchases: Purchase[],
    artistId: string,
    period: 'day' | 'week' | 'month',
  ): Array<{ date: string; sales: number; revenue: number }> {
    const groups = new Map<string, { sales: number; revenue: number }>();

    purchases.forEach(purchase => {
      const artistItems = purchase.items.filter(item => 
        this.isArtistItem(item, artistId)
      );

      if (artistItems.length === 0) return;

      const date = new Date(purchase.createdAt);
      const key = date.toISOString().split('T')[0];

      if (!groups.has(key)) {
        groups.set(key, { sales: 0, revenue: 0 });
      }

      const group = groups.get(key)!;
      const itemSales = artistItems.reduce((sum, item) => sum + item.quantity, 0);
      const itemRevenue = artistItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      
      group.sales += itemSales;
      group.revenue += itemRevenue;
    });

    return Array.from(groups.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getGeographicDistribution(
    purchases: Purchase[],
  ): Promise<Array<{ country: string; sales: number; revenue: number }>> {
    const countries = new Map<string, { sales: number; revenue: number }>();

    purchases.forEach(purchase => {
      const country = purchase.billingAddress?.country || 'Unknown';
      
      if (!countries.has(country)) {
        countries.set(country, { sales: 0, revenue: 0 });
      }

      const countryData = countries.get(country)!;
      countryData.sales += 1;
      countryData.revenue += Number(purchase.total);
    });

    return Array.from(countries.entries())
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getCustomerMetrics(purchases: Purchase[]): Promise<{
    totalCustomers: number;
    returningCustomers: number;
    averageCustomerValue: number;
  }> {
    const customerData = new Map<string, { purchases: number; revenue: number }>();

    purchases.forEach(purchase => {
      const customerId = purchase.buyerId;
      
      if (!customerData.has(customerId)) {
        customerData.set(customerId, { purchases: 0, revenue: 0 });
      }

      const data = customerData.get(customerId)!;
      data.purchases += 1;
      data.revenue += Number(purchase.total);
    });

    const totalCustomers = customerData.size;
    const returningCustomers = Array.from(customerData.values())
      .filter(data => data.purchases > 1).length;
    
    const totalRevenue = Array.from(customerData.values())
      .reduce((sum, data) => sum + data.revenue, 0);
    
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return {
      totalCustomers,
      returningCustomers,
      averageCustomerValue,
    };
  }

  private async getItemDownloadCount(itemId: string): Promise<number> {
    const result = await this.digitalDownloadRepository
      .createQueryBuilder('download')
      .leftJoin('download.purchaseItem', 'item')
      .where('item.itemId = :itemId', { itemId })
      .select('SUM(download.downloadCount)', 'total')
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }

  private async getArtistDownloadCount(artistId: string): Promise<number> {
    // This would query based on your music database structure
    // For now, returning a mock value
    return 0;
  }

  private async getArtistName(artistId: string): Promise<string> {
    // This would query your artist database
    // For now, returning a mock value
    return `Artist ${artistId}`;
  }

  private isArtistItem(item: PurchaseItem, artistId: string): boolean {
    // This would check if the item belongs to the artist
    // Implementation depends on your data structure
    // For now, returning a simple check
    return item.artistName?.includes(artistId) || false;
  }
}