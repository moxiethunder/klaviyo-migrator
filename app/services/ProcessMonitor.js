import duplicateEmailData from '#utils/duplicate-email-data'
import { AxiosError } from 'axios'
import { DateTime } from 'luxon'
import {
  DatabaseError,
  RequestError
} from '#utils/custom-errors'
import {
  getDuration,
  convertToDate,
  validateEmail,
} from '#utils/utility-functions'
import {
  createServerReply,
  createFetchEventReply,
  createLogMessage,
  formatMailerMessage,
  formatPrismaError,
  formatAxiosError,
} from '#utils/format-data'

class ProcessMonitor {
  constructor(services, initialData) {
    const { logger, mailer } = services
    const { metricId, fetchClient, publishClient, lookback } = initialData
    this.logger = services.logger
    this.mailer = services.mailer
    this.metricId = metricId
    this.eventName = undefined,
    this.exportedFrom = fetchClient
    this.exportedTo = publishClient
    this.startTime = DateTime.now()
    this.searchedFrom = DateTime.fromSeconds(lookback).toISODate()
    this.endTime = undefined
    this.duration = undefined

    this.eventContainer = {}
  }

  registerEvent(name, details) {
    if ( this.eventContainer[name] ) throw new Error(`Event ${name} already exists`)

    this.eventContainer[name] = {
      name,
      details: {
        statusCode: undefined, // http status code
        errorCode: undefined, // SHOULD_BE_STRING
        message: details.message,
        detail: details.detail,
        origin: details.origin,
      },
      successCount: 0,
      startTime: DateTime.now().toISO(),
      endTime: undefined,
      duration: undefined,
    }
  }

  getEvent(name) {
    if ( !this.eventContainer[name] ) throw new Error(`Event ${name} does not exist`)

    return this.eventContainer[name]
  }

  setEventName(name) {
    this.eventName = name
  }

  incrementSuccessCount(event) {
    this.getEvent(event).successCount++
  }

  getDuration(endTime, startTime) {
    return endTime.diff(startTime)
  }

  setEndDuration() {
    this.endTime = DateTime.now()
    this.duration = this.getDuration(this.endTime, this.startTime)
  }

  processEvents() {

  }

  processError(error) {

  }

  logFetchData(data) {

  }

  logPublishData(data) {

  }

  logEmailRecords(data) {

  }

  compareFetchToPublish() {

  }

  generateSummary() {

  }
}

export default ProcessMonitor