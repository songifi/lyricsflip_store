import { Injectable } from "@nestjs/common"
import type { AnalyticsDashboardService } from "./analytics-dashboard.service"
import type { AnalyticsQueryDto } from "../dto/analytics-query.dto"
import * as ExcelJS from "exceljs"
import * as PDFDocument from "pdfkit"

@Injectable()
export class AnalyticsExportService {
  constructor(private readonly dashboardService: AnalyticsDashboardService) {}

  async exportToExcel(artistId: string, query: AnalyticsQueryDto): Promise<Buffer> {
    const dashboard = await this.dashboardService.getArtistDashboard(artistId, query)

    const workbook = new ExcelJS.Workbook()

    // Overview sheet
    const overviewSheet = workbook.addWorksheet("Overview")
    overviewSheet.addRow(["Artist Analytics Report"])
    overviewSheet.addRow(["Artist ID", dashboard.artistId])
    overviewSheet.addRow(["Time Range", dashboard.timeRange])
    overviewSheet.addRow(["Generated", new Date().toISOString()])
    overviewSheet.addRow([])

    // Streaming metrics
    overviewSheet.addRow(["Streaming Metrics"])
    overviewSheet.addRow(["Total Streams", dashboard.streamingMetrics.totalStreams])
    overviewSheet.addRow(["Unique Listeners", dashboard.streamingMetrics.uniqueListeners])
    overviewSheet.addRow(["Skip Rate (%)", dashboard.streamingMetrics.skipRate])
    overviewSheet.addRow(["Completion Rate (%)", dashboard.streamingMetrics.completionRate])
    overviewSheet.addRow(["Growth Rate (%)", dashboard.streamingMetrics.growthRate])
    overviewSheet.addRow([])

    // Revenue metrics
    overviewSheet.addRow(["Revenue Metrics"])
    overviewSheet.addRow(["Total Revenue", dashboard.revenueMetrics.totalRevenue])
    overviewSheet.addRow(["Streaming Revenue", dashboard.revenueMetrics.streamingRevenue])
    overviewSheet.addRow(["Merchandise Revenue", dashboard.revenueMetrics.merchandiseRevenue])
    overviewSheet.addRow(["Event Revenue", dashboard.revenueMetrics.eventRevenue])
    overviewSheet.addRow(["Projected Revenue (30 days)", dashboard.revenueMetrics.projectedRevenue30Days])
    overviewSheet.addRow([])

    // Top tracks sheet
    const tracksSheet = workbook.addWorksheet("Top Tracks")
    tracksSheet.addRow(["Track ID", "Title", "Streams", "Revenue", "Growth Rate"])
    dashboard.topTracks.forEach((track) => {
      tracksSheet.addRow([track.trackId, track.title, track.streams, track.revenue, track.growthRate])
    })

    // Demographics sheet
    const demoSheet = workbook.addWorksheet("Demographics")
    demoSheet.addRow(["Age Groups"])
    demoSheet.addRow(["Age Group", "Percentage"])
    dashboard.demographics.ageGroups.forEach((age) => {
      demoSheet.addRow([age.ageGroup, age.percentage])
    })
    demoSheet.addRow([])

    demoSheet.addRow(["Gender Distribution"])
    demoSheet.addRow(["Gender", "Percentage"])
    dashboard.demographics.genderDistribution.forEach((gender) => {
      demoSheet.addRow([gender.gender, gender.percentage])
    })
    demoSheet.addRow([])

    demoSheet.addRow(["Top Countries"])
    demoSheet.addRow(["Country", "Streams", "Percentage"])
    dashboard.demographics.topCountries.forEach((country) => {
      demoSheet.addRow([country.country, country.streams, country.percentage])
    })

    return (await workbook.xlsx.writeBuffer()) as Buffer
  }

  async exportToPDF(artistId: string, query: AnalyticsQueryDto): Promise<Buffer> {
    const dashboard = await this.dashboardService.getArtistDashboard(artistId, query)

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument()
      const chunks: Buffer[] = []

      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      // Header
      doc.fontSize(20).text("Artist Analytics Report", { align: "center" })
      doc.moveDown()
      doc.fontSize(12).text(`Artist ID: ${dashboard.artistId}`)
      doc.text(`Time Range: ${dashboard.timeRange}`)
      doc.text(`Generated: ${new Date().toISOString()}`)
      doc.moveDown()

      // Streaming Metrics
      doc.fontSize(16).text("Streaming Metrics")
      doc.fontSize(12)
      doc.text(`Total Streams: ${dashboard.streamingMetrics.totalStreams.toLocaleString()}`)
      doc.text(`Unique Listeners: ${dashboard.streamingMetrics.uniqueListeners.toLocaleString()}`)
      doc.text(`Skip Rate: ${dashboard.streamingMetrics.skipRate}%`)
      doc.text(`Completion Rate: ${dashboard.streamingMetrics.completionRate}%`)
      doc.text(`Growth Rate: ${dashboard.streamingMetrics.growthRate}%`)
      doc.moveDown()

      // Revenue Metrics
      doc.fontSize(16).text("Revenue Metrics")
      doc.fontSize(12)
      doc.text(`Total Revenue: $${dashboard.revenueMetrics.totalRevenue.toLocaleString()}`)
      doc.text(`Streaming Revenue: $${dashboard.revenueMetrics.streamingRevenue.toLocaleString()}`)
      doc.text(`Merchandise Revenue: $${dashboard.revenueMetrics.merchandiseRevenue.toLocaleString()}`)
      doc.text(`Event Revenue: $${dashboard.revenueMetrics.eventRevenue.toLocaleString()}`)
      doc.moveDown()

      // Top Tracks
      doc.fontSize(16).text("Top Tracks")
      doc.fontSize(12)
      dashboard.topTracks.slice(0, 5).forEach((track, index) => {
        doc.text(`${index + 1}. ${track.title} - ${track.streams.toLocaleString()} streams`)
      })

      doc.end()
    })
  }

  async exportToCSV(artistId: string, query: AnalyticsQueryDto): Promise<string> {
    const dashboard = await this.dashboardService.getArtistDashboard(artistId, query)

    let csv = "Artist Analytics Report\n"
    csv += `Artist ID,${dashboard.artistId}\n`
    csv += `Time Range,${dashboard.timeRange}\n`
    csv += `Generated,${new Date().toISOString()}\n\n`

    csv += "Streaming Metrics\n"
    csv += "Metric,Value\n"
    csv += `Total Streams,${dashboard.streamingMetrics.totalStreams}\n`
    csv += `Unique Listeners,${dashboard.streamingMetrics.uniqueListeners}\n`
    csv += `Skip Rate,${dashboard.streamingMetrics.skipRate}%\n`
    csv += `Completion Rate,${dashboard.streamingMetrics.completionRate}%\n`
    csv += `Growth Rate,${dashboard.streamingMetrics.growthRate}%\n\n`

    csv += "Top Tracks\n"
    csv += "Track ID,Title,Streams,Revenue,Growth Rate\n"
    dashboard.topTracks.forEach((track) => {
      csv += `${track.trackId},${track.title},${track.streams},${track.revenue},${track.growthRate}%\n`
    })

    return csv
  }
}
