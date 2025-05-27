@Injectable()
export class DashboardService {
  async getUserDashboard(userId: number): Promise<any> {
    // Pull multiple metrics into single view
    return {
      userId,
      keyMetrics: {
        totalEvents: 1234,
        topTrend: 'Afrobeat Rise',
        forecast: { nextWeek: 245 },
      }
    };
  }
}
