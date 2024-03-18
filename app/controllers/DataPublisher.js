import RequestHandler from '#services/RequestHandler'
import { DatabaseError, RequestError } from '#utils/custom-errors'
import { convertToDate, configureAxiosRetry, getDuration } from '#utils/utility-functions'
import { createServerReply } from '#utils/format-data'

class DataPublisher {
  constructor(httpClient, serviceContainer) {
    
    //Request details
    this.details = serviceContainer.get('requestdetails')
    this.accountName = this.details.publishClient
    this.metricId = this.details.metricId
    this.eventName = this.details.eventName
    this.lookback = this.details.lookback
    
    //HTTP client and data
    this.httpClient = httpClient
    this.handler = new RequestHandler(this.httpClient)

    //Services
    this.logger = serviceContainer.get('logger')
    this.mailer = serviceContainer.get('mailer')

    //Database processor
    this.processor = serviceContainer.get('processor')

    //Random data
    this.successfulWrites = 0
  }

  async initPublish() {
    const newEvents = await this.processor.getNewEvents()

    const config = {
      request: {
        method: 'post',
        url: '/events',
        headers: {
          'Content-Type': 'application/json'
        },
      },
      metricId: this.metricId,
      origin: 'DataPublisher.initPublish()',
    }

    for ( const event of newEvents ) {
      const startTime = Date.now()
      const { eventId, imported, newEvent } = event
      if ( imported ) continue

      config.request.data = newEvent

      await this.handler.makeAxiosRequest(config)
      await this.processor.updateStatus(eventId)
      await this.processor.updateSuccessCount(this.metricId, 'success', 'metric')

      this.successfulWrites++
      const duration = getDuration(startTime)
      console.log({
        duration,
        message: `Published event ${eventId} to Klaviyo account ${this.accountName}`,
        metricId: this.metricId,
        eventName: this.eventName,
        count: this.successfulWrites,
        origin: 'DataPublisher.initPublish()'
      })
    }

    return {
      statusCode: 200,
      lookback: this.lookback,
      message: `Successfully published ${this.successfulWrites} new events to Klaviyo account ${this.accountName}`,
      fetched: newEvents.length,
      fetchedFrom: 'Event table',
      written: this.successfulWrites,
      accountName: this.accountName,
      errorCode: 'NO_ERROR',
      detail: `Published ${this.successfulWrites} new events to Klaviyo account ${this.accountName} for metric ID ${this.metricId}`,
      origin: 'DataPublisher.initPublish()',
      url: `${this.httpClient.defaults.baseURL}${config.request.url}`,
      metricId: this.metricId,
      eventName: this.eventName,
    }
  }
}

export default DataPublisher