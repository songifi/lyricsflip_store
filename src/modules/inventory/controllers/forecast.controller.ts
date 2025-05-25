import { Controller, Get, Post, Param, Query } from "@nestjs/common"
import type { ForecastService } from "../services/forecast.service"

@Controller("forecasts")
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Post(":inventoryItemId/generate")
  generateForecast(inventoryItemId: string, @Query('days') days?: string) {
    const daysNumber = days ? Number.parseInt(days) : 30
    return this.forecastService.generateForecast(inventoryItemId, daysNumber)
  }

  @Get(':inventoryItemId')
  getForecastsForItem(@Param('inventoryItemId') inventoryItemId: string) {
    return this.forecastService.getForecastsForItem(inventoryItemId);
  }

  @Post("generate-all")
  generateForecastsForAllItems() {
    return this.forecastService.generateForecastsForAllItems()
  }

  @Get("optimization/suggestions")
  getOptimizationSuggestions() {
    return this.forecastService.getInventoryOptimizationSuggestions()
  }
}
