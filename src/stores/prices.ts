import { defineStore } from 'pinia'
import { DateTime } from 'luxon'
import EnergiDataService from '@/services/EnergiDataService'
import { Zone, SpotPrice } from '@/types'

interface State {
  prices: SpotPrice[];
  zone: Zone;
  intervalHandler?: number;
}

interface PriceSummary {
  time: string;
  price: string;
}

const now = (): DateTime => DateTime.now()

const scaleAndFormat = (n: number): string =>
  (n / 10).toFixed(2).padStart(2, '0')

const formatDate = (aDate: DateTime): string => {
  return aDate.setLocale('da').toFormat('EEE HH:mm')
}

const parseDate = (str: string): DateTime => {
  return DateTime.fromISO(str)
}

const findCurrentPrice = (prices: SpotPrice[]): string => {
  for (let n = 0; n < prices.length; n++) {
    if (now() > parseDate(prices[n].HourDK) && now() < parseDate(prices[n + 1].HourDK)) {
      return scaleAndFormat(prices[n].SpotPriceDKK)
    }
  }

  return ''
}

const service = new EnergiDataService()

export const usePriceStore = defineStore('prices', {
  state: (): State => {
    return {
      prices: [],
      zone: Zone.East
    }
  },

  getters: {
    current: (state: State): string => findCurrentPrice(state.prices),

    summaryTable: (state: State): PriceSummary[] => {
      return state.prices
        .filter((price) => parseDate(price.HourDK) > now())
        .map((price) => ({
          time: formatDate(parseDate(price.HourDK)),
          price: scaleAndFormat(price.SpotPriceDKK)
        }))
    }
  },

  actions: {
    setZone (aZone: Zone) {
      if (this.zone !== aZone) {
        clearInterval(this.intervalHandler)
        this.zone = aZone
        this.updatePrices()
      }
    },
    updatePrices () {
      const from = now().minus({ hours: 1 })
      const to = now().plus({ hours: 24 })

      service.getEnergiData(this.zone, from, to)
        .then(data => {
          if (data.error) {
            console.log('returned error', data.error) // TODO
          } else if (data.elspotprices) {
            this.prices = data.elspotprices.map(spotprice => (
              {
                HourDK: spotprice.HourDK,
                SpotPriceEUR: spotprice.SpotPriceEUR,
                SpotPriceDKK:
                spotprice.SpotPriceDKK || spotprice.SpotPriceEUR * 7.54
              }
            ))
          }
        })

      this.intervalHandler = setInterval(this.updatePrices, 300000) // 5 minutes
    }
  }
})
