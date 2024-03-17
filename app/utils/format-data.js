import { convertToDate } from '#utils/utility-functions'

const createServerReply = (data) => {
  const { metricId, message, statusCode, searchDate, fetched, written, accountName, duration, errorCode, detail, origin, url, eventName } = data

  return {
    accountName,
    metricId,
    eventName: eventName || 'No event name available',
    message,
    statusCode,
    duration,
    details: {
      detail,
      url,
      errorCode,
      searchDate,
      origin,
      fetched: fetched || 0,
      written: written || 0,
    }
  }
}

const createFetchEventReply = (data) => {
  const searchDate = convertToDate(data.lookback)
  
  return {
    message: data.message || 'No data in search range',
    statusCode: data.statusCode || 204,
    searchDate,
    fetched: data.fetched || 0,
    written: data.written || 0,
    accountName: data.accountName,
    errorCode: data.errorCode || 'NO_DATA_IN_RANGE',
    detail: data.detail || `No data found for metric ID ${data.metricId} since ${searchDate}`,
    origin: data.origin || 'DataFetcher.initFetch()',
    url: data.url,
    metricId: data.metricId,
    eventName: data.eventName
  }
}

const createLogMessage = (config) => {

}

const formatMailerMessage = (config) => {

}

const formatPrismaError = (error) => {

}

const formatAxiosError = (error, source) => {

  const { data: { errors: [firstError] = [] } = {} } = error?.response || {}
  const { method, accountName } = error?.config || {}
  const [sourceKey, sourceValue] = Object.entries(firstError?.source || {})[0] || []
  const detail = firstError?.detail?.slice(0, -1)
  const formattedDetail = `${detail} (${sourceKey}: ${sourceValue}).`
  const formattedStack = error.stack
    .split('\n')
    .reduce((acc, line, index) => ({ ...acc, [index + 1]: line.trim() }), {})

  return {
    message: error.message,
    statusCode: firstError?.status,
    errorCode: error.code,
    requestMethod: method,
    accountName,
    detail: formattedDetail,
    origin: source,
    url: error.request?._redirectable?._currentUrl,
    stack: formattedStack,
    cause: error,
  }
}

export {
  createServerReply,
  createLogMessage,
  formatMailerMessage,
  formatPrismaError,
  formatAxiosError,
  createFetchEventReply,
}