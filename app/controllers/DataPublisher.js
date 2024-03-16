import RequestHandler from '#services/RequestHandler'
import { DatabaseError, RequestError } from '#utils/custom-errors'
import { convertToDate, configureAxiosRetry } from '#utils/utility-functions'
import { createServerReply } from '#utils/format-data'

class DataPublisher {
  constructor(httpClient, serviceContainer) {
    this.httpClient = httpClient
    this.handler = new RequestHandler(this.httpClient)
    this.logger = serviceContainer.get('logger')
    this.mailer = serviceContainer.get('mailer')
    this.details = serviceContainer.get('requestdetails')
    this.accountName = this.details.publishClient
    this.metricId = this.details.metricId
    this.lookback = this.details.lookback
  }

  fetchData() {
    // this.account is an Axios instance
    // I need to send this to /fetch-events route
    // the /fetch-events route will this.account.get(external api url, query params)
  }
}

export default DataPublisher