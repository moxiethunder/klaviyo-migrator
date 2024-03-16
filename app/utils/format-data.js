const createServerReply = (data) => {
  const { message, statusCode, searchDate, fetched, written, accountName, duration } = data

  return {
    accountName,
    message,
    statusCode,
    duration,
    details: {
      searchDate,
      fetched,
      written
    }
  }
}

const createLogMessage = (config) => {

}

const formatMailerMessage = (config) => {

}

const formatPrismaError = (error) => {

}

const formatAxiosError = (error) => {
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
    origin: 'RequestHandler.request()',
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
  formatAxiosError
}