import { DatabaseError, RequestError } from '#utils/custom-errors'
import { validateEmail } from '#utils/utility-functions'

class DataProcessor {
  constructor(database) {
    this.database = database
    this.eventName = null
    this.metricId = null
    this.dumpRows = null
    this.currentIndex = 0
    this.batchSize = 100
  }

  async getDumpDetails(metricId, clientType) {
    const response = await this.database.getDumpDetails(metricId, clientType)

    const { eventName, fetchClient, publishClient } = response
    this.setEventName(eventName)
    this.setMetricId(metricId)

    return {
      eventName,
      fetchClient,
      publishClient
    }
  }

  async updateSuccessCount(id, column, table) {
    await this.database.incrementCounter(id, column, table)
  }

  async updateStatus(eventId) {
    await this.database.updateImportStatus(eventId)
  }

  async dataDump(data) {
    const uniqueId = data.data[0].id
    const hasNext = data.links.next !== null
    const response = await this.database.insertDump(uniqueId, this.metricId, this.eventName, data)

    return {
      isUnique: response,
      hasNext: hasNext
        ? data.links.next
        : false
    }
  }

  async writeFetchedEvent() {
    if ( !this.dumpRows || this.dumpRows.length === 0 ) {
      const metricSearch = await this.database.getDataByMetricRelationship(this.metricId, 'dumps')
      this.dumpRows = metricSearch.dumps
    }

    await this.processDumpBatch()
  }

  async processDumpBatch() {
    const dumpRowsSubset = this.dumpRows.slice(this.currentIndex, this.currentIndex + this.batchSize)

    if ( dumpRowsSubset.length === 0 ) {
      console.log('No more dump rows to batch process')
      return
    }

    const eventObjects = dumpRowsSubset.flatMap(dump => {
      const data = JSON.parse(dump.requestData)
      const events = data.data
      const profiles = data.included
      const metricId = this.metricId
      const eventName = this.eventName

      return events.map(event => {
        const eventId = event.id
        const profileId = event.relationships.profile.data.id
        const timestamp = event.attributes.datetime
        const eventProperties = event.attributes.event_properties
        const userEmail = profiles.find(profile => profile.id === profileId)?.attributes?.email || 'unknown'

        const config = {
          properties: eventProperties,
          time: timestamp,
          name: eventName,
          email: userEmail,
        }

        return {
          metricId,
          eventId,
          eventName,
          profileId,
          userEmail,
          fetchedEvent: event,
          newEvent: this.createEventObject(config)
        }
      })
    })

    for ( const event of eventObjects ) {
      if ( !validateEmail(event.userEmail) ) {
        await this.database.createEvent(event, 'invalid')
        continue
      }

      await this.database.createEvent(event, 'event')
    }

    this.currentIndex += this.batchSize
    await this.processDumpBatch()
  }

  setMetricId(metricId) {
    this.metricId = metricId
  }

  setEventName(eventName) {
    this.eventName = eventName
  }

  async setMetricRelationship(metricId, eventName) {
    this.setMetricId(metricId)
    this.setEventName(eventName)

    await this.database.setMetric(metricId, eventName)
    return true
  }

  async getNewEvents() {
    const metricSearch = await this.database.getDataByMetricRelationship(this.metricId, 'events')
    
    return metricSearch.events.map(event => {
      return {
        eventId: event.eventId,
        imported: event.imported,
        newEvent: event.newEvent,
      }
    }).filter(Boolean)
  }

  createEventObject(config) {
    const { properties, time, name, email } = config

    return {
      data: {
        type: 'event',
        attributes: {
          properties,
          time,
          metric: {
            data: {
              type: 'metric',
              attributes: {
                name,
              },
            },
          },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
              },
            },
          },
        },
      },
    }
  }
}

export default DataProcessor