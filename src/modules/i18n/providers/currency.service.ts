import { Injectable } from "@nestjs/common"

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  decimalPlaces: number
}

export interface FormattedPrice {
  amount: number
  currency: string
  formatted: string
  symbol: string
}

@Injectable()
export class CurrencyService {
  private readonly currencies: Map<string, CurrencyInfo> = new Map([
    ["USD", { code: "USD", symbol: "$", name: "US Dollar", decimalPlaces: 2 }],
    ["EUR", { code: "EUR", symbol: "€", name: "Euro", decimalPlaces: 2 }],
    ["GBP", { code: "GBP", symbol: "£", name: "British Pound", decimalPlaces: 2 }],
    ["JPY", { code: "JPY", symbol: "¥", name: "Japanese Yen", decimalPlaces: 0 }],
    ["CAD", { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimalPlaces: 2 }],
    ["AUD", { code: "AUD", symbol: "A$", name: "Australian Dollar", decimalPlaces: 2 }],
    ["CHF", { code: "CHF", symbol: "CHF", name: "Swiss Franc", decimalPlaces: 2 }],
    ["CNY", { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimalPlaces: 2 }],
    ["KRW", { code: "KRW", symbol: "₩", name: "South Korean Won", decimalPlaces: 0 }],
    ["BRL", { code: "BRL", symbol: "R$", name: "Brazilian Real", decimalPlaces: 2 }],
    ["MXN", { code: "MXN", symbol: "$", name: "Mexican Peso", decimalPlaces: 2 }],
    ["INR", { code: "INR", symbol: "₹", name: "Indian Rupee", decimalPlaces: 2 }],
  ])

  private readonly regionCurrencyMap: Map<string, string> = new Map([
    ["US", "USD"],
    ["CA", "CAD"],
    ["GB", "GBP"],
    ["EU", "EUR"],
    ["DE", "EUR"],
    ["FR", "EUR"],
    ["IT", "EUR"],
    ["ES", "EUR"],
    ["JP", "JPY"],
    ["KR", "KRW"],
    ["CN", "CNY"],
    ["AU", "AUD"],
    ["CH", "CHF"],
    ["BR", "BRL"],
    ["MX", "MXN"],
    ["IN", "INR"],
  ])

  getCurrencyByRegion(region: string): string {
    return this.regionCurrencyMap.get(region.toUpperCase()) || "USD"
  }

  getCurrencyInfo(currencyCode: string): CurrencyInfo | null {
    return this.currencies.get(currencyCode.toUpperCase()) || null
  }

  formatPrice(amount: number, currencyCode: string, locale = "en-US"): FormattedPrice {
    const currency = this.getCurrencyInfo(currencyCode)
    if (!currency) {
      throw new Error(`Unsupported currency: ${currencyCode}`)
    }

    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    })

    return {
      amount,
      currency: currency.code,
      formatted: formatter.format(amount),
      symbol: currency.symbol,
    }
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    // In a real implementation, you would call an external API
    // For now, we'll use mock exchange rates
    const mockRates: Record<string, number> = {
      "USD-EUR": 0.85,
      "USD-GBP": 0.73,
      "USD-JPY": 110,
      "USD-CAD": 1.25,
      "EUR-USD": 1.18,
      "GBP-USD": 1.37,
      "JPY-USD": 0.009,
      "CAD-USD": 0.8,
    }

    const rateKey = `${fromCurrency}-${toCurrency}`
    const rate = mockRates[rateKey] || 1

    return amount * rate
  }

  getSupportedCurrencies(): CurrencyInfo[] {
    return Array.from(this.currencies.values())
  }
}
