import type { DataSource } from "typeorm"
import { Gear, GearCategory, GearCondition, GearStatus } from "../../modules/gear/entities/gear.entity"
import { GearImage } from "../../modules/gear/entities/gear-image.entity"
import { GearShipping, ShippingMethod } from "../../modules/gear/entities/gear-shipping.entity"

export class GearSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const gearRepository = dataSource.getRepository(Gear)
    const imageRepository = dataSource.getRepository(GearImage)
    const shippingRepository = dataSource.getRepository(GearShipping)

    // Sample gear data
    const sampleGear = [
      {
        title: "Fender Player Stratocaster",
        description: "Classic electric guitar with versatile tone and comfortable playability. Perfect for any genre.",
        category: GearCategory.GUITARS,
        brand: "Fender",
        model: "Player Stratocaster",
        year: "2023",
        condition: GearCondition.EXCELLENT,
        price: 850.0,
        originalPrice: 950.0,
        rentalPriceDaily: 25.0,
        rentalPriceWeekly: 150.0,
        rentalPriceMonthly: 500.0,
        specifications: {
          bodyWood: "Alder",
          neckWood: "Maple",
          fretboard: "Maple",
          pickups: "Player Series Alnico 5 Strat Single-Coil",
          scale: '25.5"',
          frets: 22,
        },
        features: ["Tremolo bridge", "Modern C neck shape", "3 single-coil pickups"],
        includedAccessories: ["Gig bag", "Strap", "Cable"],
        status: GearStatus.ACTIVE,
        allowsRental: true,
        weight: 3.5,
        dimensions: { length: 100, width: 35, height: 5 },
        location: "New York, NY",
        sellerId: "550e8400-e29b-41d4-a716-446655440000", // Replace with actual user ID
      },
      {
        title: "Marshall DSL40CR Tube Amp",
        description:
          "Versatile 40-watt tube amplifier with classic Marshall tone. Great for studio and live performance.",
        category: GearCategory.AMPLIFIERS,
        brand: "Marshall",
        model: "DSL40CR",
        year: "2022",
        condition: GearCondition.VERY_GOOD,
        price: 650.0,
        rentalPriceDaily: 30.0,
        rentalPriceWeekly: 180.0,
        specifications: {
          power: "40W",
          tubes: "3 x ECC83, 2 x EL34",
          channels: 2,
          speaker: '12" Celestion Seventy 80',
          effects: "Reverb",
        },
        features: ["2 channels", "Built-in reverb", "FX loop", "DI output"],
        includedAccessories: ["Power cable", "Footswitch"],
        status: GearStatus.ACTIVE,
        allowsRental: true,
        requiresInsurance: true,
        weight: 22.0,
        dimensions: { length: 60, width: 50, height: 45 },
        location: "Los Angeles, CA",
        sellerId: "550e8400-e29b-41d4-a716-446655440001", // Replace with actual user ID
      },
    ]

    for (const gearData of sampleGear) {
      const gear = gearRepository.create(gearData)
      const savedGear = await gearRepository.save(gear)

      // Add sample images
      const images = [
        {
          url: "/placeholder.svg?height=400&width=600",
          alt: `${gearData.title} - Main view`,
          sortOrder: 0,
          isPrimary: true,
          gearId: savedGear.id,
        },
        {
          url: "/placeholder.svg?height=400&width=600",
          alt: `${gearData.title} - Side view`,
          sortOrder: 1,
          isPrimary: false,
          gearId: savedGear.id,
        },
      ]

      await imageRepository.save(images)

      // Add shipping options
      const shippingOptions = [
        {
          gearId: savedGear.id,
          method: ShippingMethod.STANDARD,
          cost: 25.0,
          estimatedDays: 5,
          insuranceIncluded: false,
          trackingIncluded: true,
          description: "Standard ground shipping",
        },
        {
          gearId: savedGear.id,
          method: ShippingMethod.EXPRESS,
          cost: 45.0,
          estimatedDays: 2,
          insuranceIncluded: true,
          insuranceCost: 15.0,
          trackingIncluded: true,
          description: "Express shipping with insurance",
        },
      ]

      await shippingRepository.save(shippingOptions)
    }
  }
}
