import { defineStore } from 'pinia'
import axios from 'axios'
import { DateTime } from 'luxon';

interface SpotPrice {
  HourDK: string;
  SpotPriceDKK: number;
  SpotPriceEUR: number;
}

interface ElSpotData {
  elspotprices: SpotPrice[];
}

interface ElSpotResponse {
  data: ElSpotData;
}

interface State {
  prices: SpotPrice[];
}

interface PriceSummary {
  time: string;
  price: string;
}

const api = axios.create({
  baseURL: 'https://data-api.energidataservice.dk',
  headers: {
    'content-type': 'application/json',
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

      const body = {
        operationName: 'Dataset',
        variables: {},
        query: `query Dataset {elspotprices(where:{PriceArea:{_eq: "DK2"},HourDK:{_gte:"${formatDate(from)}",_lte:"${formatDate(to)}"}} order_by:{HourDK: asc} limit:100 offset:0) {HourDK SpotPriceDKK SpotPriceEUR}}`
      }

      api
        .post<ElSpotResponse>('/v1/graphql', JSON.stringify(body))
        .then((response) => {
          const { data } = response

          this.prices = data.data.elspotprices.map((spotprice) => ({
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
