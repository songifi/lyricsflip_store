import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { FestivalLocation, type LocationType } from "../../database/entities/festival-location.entity"

@Injectable()
export class FestivalMapService {
  private locationRepository: Repository<FestivalLocation>

  constructor(
    @InjectRepository(FestivalLocation)
    locationRepository: Repository<FestivalLocation>,
  ) {
    this.locationRepository = locationRepository;
  }

  async getFestivalMap(festivalId: string) {
    const locations = await this.locationRepository.find({
      where: { festivalId, isActive: true },
      order: { type: "ASC", name: "ASC" },
    })

    // Group locations by type for better organization
    const groupedLocations = locations.reduce((acc, location) => {
      if (!acc[location.type]) {
        acc[location.type] = []
      }
      acc[location.type].push(location)
      return acc
    }, {})

    return {
      locations: groupedLocations,
      totalLocations: locations.length,
      bounds: this.calculateMapBounds(locations),
    }
  }

  async getLocationsByType(festivalId: string, type: LocationType): Promise<FestivalLocation[]> {
    return await this.locationRepository.find({
      where: { festivalId, type, isActive: true },
      order: { name: "ASC" },
    })
  }

  async getNearbyLocations(
    festivalId: string,
    latitude: number,
    longitude: number,
    radiusKm = 0.5,
  ): Promise<FestivalLocation[]> {
    // Using Haversine formula for distance calculation
    const query = `
      SELECT *, (
        6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )
      ) AS distance
      FROM festival_locations
      WHERE festivalId = ? AND isActive = true
      HAVING distance < ?
      ORDER BY distance
    `

    return await this.locationRepository.query(query, [latitude, longitude, latitude, festivalId, radiusKm])
  }

  async getNavigationRoute(festivalId: string, fromLocationId: string, toLocationId: string) {
    const fromLocation = await this.locationRepository.findOne({
      where: { id: fromLocationId, festivalId },
    })
    const toLocation = await this.locationRepository.findOne({
      where: { id: toLocationId, festivalId },
    })

    if (!fromLocation || !toLocation) {
      throw new Error("One or both locations not found")
    }

    // Simple straight-line navigation (in a real implementation, you'd use a pathfinding algorithm)
    const distance = this.calculateDistance(
      fromLocation.latitude,
      fromLocation.longitude,
      toLocation.latitude,
      toLocation.longitude,
    )

    return {
      from: fromLocation,
      to: toLocation,
      distance: `${Math.round(distance * 1000)}m`,
      estimatedWalkTime: `${Math.ceil(distance * 12)} minutes`, // Assuming 5 km/h walking speed
      waypoints: [
        { lat: fromLocation.latitude, lng: fromLocation.longitude },
        { lat: toLocation.latitude, lng: toLocation.longitude },
      ],
    }
  }

  private calculateMapBounds(locations: FestivalLocation[]) {
    if (locations.length === 0) return null

    const lats = locations.map((l) => l.latitude)
    const lngs = locations.map((l) => l.longitude)

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}
