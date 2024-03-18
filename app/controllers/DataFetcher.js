import RequestHandler from '#services/RequestHandler'
import { DatabaseError, RequestError } from '#utils/custom-errors'
import { convertToDate, configureAxiosRetry } from '#utils/utility-functions'
import { createServerReply, createFetchEventReply } from '#utils/format-data'

class DataFetcher {
  constructor(httpClient, serviceContainer) {
    //Request details
    this.details = serviceContainer.get('requestdetails')
    this.metricId = this.details.metricId
    this.lookback = this.details.lookback
    this.accountName = this.details.fetchClient
    this.eventName = 'No event name available'

    //HTTP client and data
    this.httpClient = httpClient
    this.handler = new RequestHandler(this.httpClient)

    //Services
    this.logger = serviceContainer.get('logger')
    this.mailer = serviceContainer.get('mailer')
    
    //Database processor
    this.processor = serviceContainer.get('processor')

    //Setup functions
    configureAxiosRetry(this.httpClient, { retries: 3 }, this.onRetry)

    //Random data
    this.isInitialRequest = true
    this.successfulRequests = 0
    this.successfulWrites = 0
  }

  async initFetch() {
    try {
      await this.fetchMetricName()

      const fetchResponse = await this.fetchEventData()
      if ( fetchResponse.statusCode === 204 ) return fetchResponse

      await this.processor.writeFetchedEvents()

      return fetchResponse
    } catch (error) {
      // const errorType = error.constructor.name
      console.log('Error from DataFetcher.initFetch()', error)
    }
  }

  async fetchMetricName() {
    const config = {
      request: {
        url: `/metrics/${this.metricId}`,
        method: 'get',
        params: {
          'fields[metric]': 'name'
        }
      },
      metricId: this.metricId
    }

    const eventName = await this.handler.makeAxiosRequest(config)
    this.eventName = eventName.data.attributes.name
    this.details.eventName = this.eventName
  }

  async fetchEventData(url=null) {
    const defaultConfig = {
      request: {
        url: '/events',
        method: 'get',
        params: {
          'fields[event]': 'event_properties,datetime',
          'fields[metric]': 'name',
          'fields[profile]': 'email',
          'include': 'metric,profile',
          'filter': `equals(metric_id,'${this.metricId}'),greater-or-equal(timestamp,${this.lookback})`,
        }
      },
      metricId: this.metricId,
      origin: 'DataFetcher.fetchEventData()'
    }

    const config = this.isInitialRequest
    ? defaultConfig
    : { request: { url, method: 'get' }, metricId: this.metricId, origin: 'DataFetcher.fetchEventData()'}

    const requestResponse = await this.handler.makeAxiosRequest(config)
    if ( requestResponse.data.length === 0 ) return {
      statusCode: 204,
      reply: createFetchEventReply({
        lookback: this.lookback,
        accountName: this.accountName,
        metricId: this.metricId,
        eventName: this.eventName,
        url: `${config.url}/?${new URLSearchParams(config.params).toString()}`
      })
    }

    this.successfulRequests++

    if ( this.isInitialRequest ) {
      await this.processor.setMetricRelationship(this.metricId, this.eventName)
      this.isInitialRequest = false
    }

    const databaseResponse = await this.processor.dataDump(requestResponse)
    if ( databaseResponse.isUnique ) this.successfulWrites++

    if ( databaseResponse.hasNext ) {
      return await this.fetchEventData(databaseResponse.hasNext)
    }

    return {
      statusCode: 200,
      reply: createFetchEventReply({
        message: `Data for metric ID ${this.metricId} has been fetched and written to the database`,
        lookback: this.lookback,
        statusCode: 200,
        fetched: this.successfulRequests,
        written: this.successfulWrites,
        accountName: this.accountName,
        errorCode: 'NO_ERROR',
        detail: `${this.successfulWrites} records written to 'Dump' table for metric ID ${this.metricId} going back to ${convertToDate(this.lookback)}`,
        origin: 'DataFetcher.fetchEventData()',
        url: databaseResponse.hasNext,
        metricId: this.metricId,
        eventName: this.eventName
      })
    }
  }

  onRetry(retryCount, error, config) {
    console.log(`Retry attempt #${retryCount} for ${config.url}`)
  }
}

export default DataFetcher