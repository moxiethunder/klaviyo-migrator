import RequestHandler from '#services/RequestHandler'
import { DatabaseError, RequestError } from '#utils/custom-errors'
import { convertToDate, configureAxiosRetry } from '#utils/utility-functions'
import { createServerReply } from '#utils/format-data'

class DataFetcher {
  constructor(httpClient, serviceContainer) {
    //Request details
    this.details = serviceContainer.get('requestdetails')
    this.metricId = this.details.metricId
    this.lookback = this.details.lookback
    this.accountName = this.details.fetchClient

    //HTTP client and data
    this.httpClient = httpClient
    this.handler = new RequestHandler(this.httpClient)

    //Services
    this.logger = serviceContainer.get('logger')
    this.mailer = serviceContainer.get('mailer')
    
    //Database handler
    this.processor = serviceContainer.get('processor')

    //Setup functions
    configureAxiosRetry(this.httpClient, { retries: 3 }, this.onRetry)

    //Random data
    this.successfulRequests = 0
    this.successfulWrites = 0
  }

  async fetchData(url=null, isInitial=true) {
    try {
      const config = isInitial
      ? this.initialRequestConfig()
      : { url, method: 'get' }

      const response = await this.handler.request(config)

      if ( response.data.length === 0 ) return createServerReply({
        message: 'No data in search range',
        statusCode: 204,
        searchDate: convertToDate(this.lookback),
        fetched: this.successfulRequests,
        written: this.successfulWrites,
        accountName: this.accountName,
      })

      if ( isInitial ) {
        console.log('initial')
      }


    } catch (error) {
      console.log('Error: DataFetcher.fetchData', error)
      if ( error instanceof RequestError ) throw new Error
    }
  }

  initialRequestConfig() {
    return {
      url: '/events',
      method: 'get',
      params: {
        'fields[event]': 'event_properties,timestamp',
        'fields[metric]': 'name',
        'fields[profile]': 'email',
        'include': 'metric,profile',
        'filter': `equals(metric_id,'${this.metricId}'),greater-or-equal(timestamp,${this.lookback})`,
      }
    }
  }

  onRetry(retryCount, error, config) {
    console.log(`Retry attempt #${retryCount} for ${config.url}`)
  }
}

export default DataFetcher