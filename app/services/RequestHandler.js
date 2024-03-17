import { RequestError, isAxiosError, handleAxiosError } from '#utils/custom-errors'
import { AxiosError } from 'axios'
import { formatAxiosError } from '#utils/format-data'

class RequestHandler {
  constructor(httpClient) {
    this.httpClient = httpClient
  }

  async metricNameRequest(config) {
    try {
      const response = await this.httpClient.request(config.request)
      return response.data
    } catch (error) {
      if ( isAxiosError(error) ) {
        const newError = handleAxiosError(error, 'RequestHandler.metricRequest()', config.metricId)
        throw newError
      }
    }
  }

  async getEventsRequest(config) {
    try {
      const response = await this.httpClient.request(config)
      return response.data
    } catch (error) {
      if ( error instanceof AxiosError ) {
        const errorObject = formatAxiosError(error)
        const { message, statusCode, errorCode, requestMethod, accountName, detail, origin, url, stack, cause } = errorObject

        throw new RequestError(detail, {
          accountName,
          message,
          statusCode,
          errorCode,
          requestMethod,
          origin,
          url,
        }, stack, cause)
      } else {
        throw error
      }
    }
  }


}

export default RequestHandler