import { defineStore } from "pinia";
import axios from "axios";
import "moment/locale/da";
import moment from "moment";

interface SpotPrice {
  HourDK: string;
  SpotPriceDKK: number;
}

interface ElSpotData {
  elspotprices: SpotPrice[];
}

interface ElSpotResponse {
  data: ElSpotData;
}

interface State {
  prices: SpotPrice[];
  lastUpdate: moment.Moment | null;
}

interface LowestPriceDetails {
  price: string;
  start: string;
  end: string;
  day: string;
}

const api = axios.create({
  baseURL: "https://data-api.energidataservice.dk",
  headers: {
    "content-type": "application/json",
    timeout: 2000,
  },
});

const now = (): moment.Moment => moment();

const leftpad = (n: number): string => n.toString().padStart(2, "0");

const scaleAndFormat = (n: number): string => (n / 10).toFixed(2);

const formatDate = (aDate: moment.Moment): string => {
  return aDate.format("YYYY-MM-DDTHH:mm");
};

const findCurrentPrice = (prices: SpotPrice[]): string => {
  for (let n = 0; n < prices.length; n++) {
    if (
      now().isAfter(moment(prices[n].HourDK)) &&
      now().isBefore(moment(prices[n + 1].HourDK))
    ) {
      return scaleAndFormat(prices[n].SpotPriceDKK);
    }
  }

  return "";
};

const findLowest = (spotPrices: SpotPrice[]): LowestPriceDetails => {
  const sortedByPrice = spotPrices
    .slice()
    .sort((a, b) => a.SpotPriceDKK - b.SpotPriceDKK);

  //console.log(sortedByPrice);

  const lowestPrice = sortedByPrice[0];

  return {
    price: scaleAndFormat(lowestPrice.SpotPriceDKK),
    start: leftpad(moment(lowestPrice.HourDK).minute()),
    end: leftpad(moment(lowestPrice.HourDK).minute() + 1), // TODO not quite right
    day: moment(lowestPrice.HourDK).isAfter(now()) ? "morgen" : "dag",
  };
};

export const usePriceStore = defineStore("prices", {
  state: (): State => {
    return {
      prices: [],
      lastUpdate: null,
    };
  },

  getters: {
    current(state) {
      return findCurrentPrice(state.prices);
    },
    lowest(state): LowestPriceDetails {
      return findLowest(state.prices);
    },
    lastUpdated(state): string {
      return state.lastUpdate ? formatDate(state.lastUpdate) : "";
    },
  },

  actions: {
    updatePrices() {
      const from = now().subtract(1, "hour");
      const to = now().add(24, "hours");

      const body = {
        operationName: "Dataset",
        variables: {},
        // prettier-ignore
        query: `query Dataset {elspotprices(where:{PriceArea:{_eq: "DK2"},HourDK:{_gte:"${formatDate(from)}",_lte:"${formatDate(to)}"}} order_by:{HourDK: asc} limit:100 offset:0) {HourDK SpotPriceDKK }}`,
      };

      api
        .post<ElSpotResponse>("/v1/graphql", JSON.stringify(body))
        .then((response) => {
          const { data } = response;

          this.prices = data.data.elspotprices;
          this.lastUpdate = now();
        });

      setInterval(this.updatePrices, 300000); // 5 minutes
    },
  },
});
