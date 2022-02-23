import { defineStore } from 'pinia'
import axios from 'axios'
import 'moment/locale/da'
import moment from 'moment'

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

const now = (): moment.Moment => moment()

const scaleAndFormat = (n: number): string =>
  (n / 10).toFixed(2).padStart(2, '0')

const formatDate = (aDate: moment.Moment, short = false): string => {
  return short ? aDate.format('ddd HH:mm') : aDate.format('YYYY-MM-DDTHH:mm')
}

const findCurrentPrice = (prices: SpotPrice[]): string => {
  for (let n = 0; n < prices.length; n++) {
    if (
      now().isAfter(moment(prices[n].HourDK)) &&
      now().isBefore(moment(prices[n + 1].HourDK))
    ) {
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
        .filter((price) => moment(price.HourDK).isAfter(now()))
        .map((price) => ({
          time: formatDate(moment(price.HourDK), true),
          price: scaleAndFormat(price.SpotPriceDKK)
        }))
    }
  },

  actions: {
    updatePrices () {
      const from = now().subtract(1, 'hour')
      const to = now().add(24, 'hours')

      const body = {
        operationName: 'Dataset',
        variables: {},
        // prettier-ignore
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
