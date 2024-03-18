import { isAxiosError, handleAxiosError } from '#utils/custom-errors'

class RequestHandler {
  constructor(httpClient) {
    this.httpClient = httpClient
  }

  async makeAxiosRequest(config) {
    try {
      const response = await this.httpClient.request(config.request)
      return response.data
    } catch (error) {
      if ( isAxiosError(error) ) {
        const newError = handleAxiosError(error, 'RequestHandler.makeAxiosRequest()', config.metricId)
        throw newError
      }
    }
  }
}

export default RequestHandler