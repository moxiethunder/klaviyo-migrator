import RequestHandler from '#services/RequestHandler'
import { DatabaseError, RequestError } from '#utils/custom-errors'
import { convertToDate, configureAxiosRetry } from '#utils/utility-functions'
import { createServerReply } from '#utils/format-data'

class DataPublisher {
  constructor(httpClient, serviceContainer) {
    
    //Request details
    this.details = serviceContainer.get('requestdetails')
    this.accountName = this.details.publishClient
    this.metricId = this.details.metricId
    this.eventName = this.details.eventName
    
    //HTTP client and data
    this.httpClient = httpClient
    this.handler = new RequestHandler(this.httpClient)

    //Services
    this.logger = serviceContainer.get('logger')
    this.mailer = serviceContainer.get('mailer')

    //Database processor
    this.processor = serviceContainer.get('processor')
  }

  intitPublish() {
  }
}

export default DataPublisher