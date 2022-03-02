export interface SpotPrice {
  HourDK: string;
  SpotPriceDKK: number;
  SpotPriceEUR: number;
}

export interface ElSpotData {
  elspotprices?: SpotPrice[];
  error?: string;
}

export interface State {
  prices: SpotPrice[];
}

export interface PriceSummary {
  time: string;
  price: string;
}

export enum Zone {
  West = 'DK1',
  East = 'DK2'
}
