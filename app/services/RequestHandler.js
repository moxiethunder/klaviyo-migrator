import { RequestError } from '#utils/custom-errors'
import { AxiosError } from 'axios'
import { formatAxiosError } from '#utils/format-data'

class RequestHandler {
  constructor(httpClient) {
    this.httpClient = httpClient
  }

  async request(config) {
    try {
      const response = await this.httpClient(config)
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