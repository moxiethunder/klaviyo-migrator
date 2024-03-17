import { AxiosError } from 'axios'
import { formatAxiosError } from '#utils/format-data'

class DatabaseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseError'
  }
}

class RequestError extends Error {
  constructor(message, meta, stack, cause) {
    super(message)
    this.name = 'RequestError'
    this.meta = meta
    this.customStack = stack
    this.causedBy = cause
  }
}

const isAxiosError = (error) => {
  return error instanceof AxiosError
}

const handleAxiosError = (error, source, metricId=null) => {
  const errorObject = formatAxiosError(error, source)
  const { message, statusCode, errorCode, requestMethod, accountName, detail, origin, url, stack, cause } = errorObject

  return new RequestError(detail, {
    message,
    statusCode,
    errorCode,
    requestMethod,
    accountName,
    detail,
    origin,
    url,
    metricId,
  }, stack, cause)
}

export { DatabaseError, RequestError, isAxiosError, handleAxiosError }
