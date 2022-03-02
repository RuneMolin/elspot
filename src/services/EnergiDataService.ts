import { ElSpotData, Zone } from '@/types'
import axios, { AxiosInstance } from 'axios'
import { DateTime } from 'luxon'

interface ElSpotResponse {
  data: ElSpotData;
}

export default class EnergiDataService {
  api: AxiosInstance

  constructor () {
    this.api = axios.create({
      baseURL: 'https://data-api.energidataservice.dk',
      headers: {
        'content-type': 'application/json',
        timeout: 2000
      }
    })
  }

  private formatDate = (aDate: DateTime): string => aDate.toFormat("y-MM-dd'T'HH:mm")

  async getEnergiData (zone: Zone, from: DateTime, to: DateTime): Promise<ElSpotData> {
    const body = {
      operationName: 'Dataset',
      variables: {},
      query: `query Dataset {elspotprices(where:{PriceArea:{_eq: "${zone}"},HourDK:{_gte:"${this.formatDate(from)}",_lte:"${this.formatDate(to)}"}} order_by:{HourDK: asc} limit:100 offset:0) {HourDK SpotPriceDKK SpotPriceEUR}}`
    }

    try {
      const axiosResponse = await this.api
        .post<ElSpotResponse>('/v1/graphql', JSON.stringify(body))
      const elspotResponse = axiosResponse.data
      return elspotResponse.data
    } catch (error) {
      return await Promise.reject(error)
    }
  }
}
