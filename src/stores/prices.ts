import { defineStore } from 'pinia'
import axios from 'axios'
import { DateTime } from 'luxon';

interface SpotPrice {
  HourDK: string;
  SpotPriceDKK: number;
  SpotPriceEUR: number;
}

interface ElSpotResponse {
  records: SpotPrice[];
}

interface State {
  prices: SpotPrice[];
}

interface PriceSummary {
  time: string;
  price: string;
}

const api = axios.create({
  baseURL: 'https://api.energidataservice.dk',
  headers: {
    'Content-Type': 'application/json',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Dest': 'script',
    'Sec-Fetch-Site': 'cross-site',
    timeout: 2000
  }
})

const now = (): DateTime => DateTime.now();

const scaleAndFormat = (n: number): string =>
  (n / 10).toFixed(2).padStart(2, '0')

const formatDate = (aDate: DateTime, short = false): string => {
  return short ? aDate.setLocale('da').toFormat('EEE HH:mm') : aDate.toFormat("y-MM-dd'T'HH:mm");
}

const parseDate = (str: string): DateTime => {
  return DateTime.fromISO(str);
}

const findCurrentPrice = (prices: SpotPrice[]): string => {
  for (let n = 0; n < prices.length; n++) {
    if (now() > parseDate(prices[n].HourDK) && now() < parseDate(prices[n + 1].HourDK)) {
      return scaleAndFormat(prices[n].SpotPriceDKK)
    }
  }

  return ''
}

export const usePriceStore = defineStore('prices', {
  state: (): State => {
    return {
      prices: []
    }
  },

  getters: {
    current: (state: State): string => findCurrentPrice(state.prices),

    summaryTable: (state: State): PriceSummary[] => {
      return state.prices
        .filter((price) => parseDate(price.HourDK) > now())
        .map((price) => ({
          time: formatDate(parseDate(price.HourDK), true),
          price: scaleAndFormat(price.SpotPriceDKK)
        }))
    }
  },

  actions: {
    updatePrices () {
      const from = now().minus({ hours: 1})
      const to = now().plus({hours: 24})

      const params = {
        start: formatDate(from),
        end: formatDate(to),
        columns: 'HourDK,SpotPriceDKK,SpotPriceEUR',
        sort: 'HourDK',
        offset: 0,
        limit: 100
      }

      api
        .get<ElSpotResponse>('/dataset/Elspotprices', { params })
        .then((response) => {
          const { data } = response

          this.prices = data.records.map((spotprice) => ({
            HourDK: spotprice.HourDK,
            SpotPriceEUR: spotprice.SpotPriceEUR,
            SpotPriceDKK:
              spotprice.SpotPriceDKK || spotprice.SpotPriceEUR * 7.54
          }))
        })

      setInterval(this.updatePrices, 300000) // 5 minutes
    }
  }
})
