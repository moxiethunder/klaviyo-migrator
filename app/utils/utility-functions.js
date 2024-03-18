import { DateTime } from 'luxon'
import axiosRetry from 'axios-retry'
import isEmail from 'validator/lib/isEmail.js'

const configureAxiosRetry = (httpClient, config, callback) => {
  axiosRetry(httpClient, {
    retries: config.retries,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: axiosRetry.isRetryableError,
    onRetry: (retryCount, error, config) => callback(retryCount, error, config)
  })
}

const validateParams = (params) => {
  const { metric_id, account_names, search_date } = params
  if (!metric_id || !account_names || !search_date)
    return {
      validate: false,
      error: 'Missing required parameters',
      example: '?metric_id=xyz123&account_names=account1,account2&search_date=2021-01-01'
    }

  const date = DateTime.fromISO(search_date)
  const accountNames = account_names.split(',')
  const accountTypes = accountNames.reduce((acc, name, index) => {
    const role = index === 0
      ? 'fetch'
      : 'publish'

      acc[role] = name.trim()

      return acc
  }, {})

  if ( date.toISODate() !== search_date )
    return {
      validate: false,
      error: 'Invalid date format. Please use YYYY-MM-DD.',
      example: '?search_date=2021-01-01'
    }

  if ( accountNames.length !== 2 )
    return {
      validate: false,
      error: 'Invalid client names. Please provide two client names.',
      example: '?account_names=account1,account2'
    }

  return {
    validate: true,
    accountNames: accountTypes,
    lookback: getSecondsPassed(date)
  }
}

const getDuration = (startTime) => {
  const start = DateTime.fromMillis(startTime)
  const end = DateTime.now()
  const duration = end.diff(start)

  return duration.toFormat('hh:mm:ss:SSS')
}

const getSecondsPassed = (date) => {
  const since = DateTime.fromISO(date) === date
    ? date
    : DateTime.fromISO(date)
    
  const now = DateTime.now()
  const daysPassed = now.diff(since, 'days').days
  return now.minus({ days: daysPassed }).toSeconds()
}

const convertToDate = (time) => {
  return DateTime.fromSeconds(time).toISODate()
}

const validateEmail = (userEmail) => {
  return userEmail !== undefined && userEmail !== null
    ? isEmail(userEmail)
    : false
}

export { configureAxiosRetry, validateParams, getDuration, convertToDate, validateEmail }