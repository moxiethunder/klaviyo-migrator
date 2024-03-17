import { DatabaseError, RequestError } from '#utils/custom-errors'
import { validateEmail } from '#utils/utility-functions'

class DataProcessor {
  constructor(database) {
    this.database = database
    this.eventName = null
    this.metricId = null
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

  async writeFetchedEvents() {
    let writtenEvents = 0
    const metricSearch = await this.database.getDumpData(this.metricId)
    const dumpRows = metricSearch.dumps

    const eventObjects = dumpRows.flatMap(dump => {
      const data = JSON.parse(dump.requestData)
      const events = data.data
      const profiles = data.included
      const metricId = this.metricId
      const eventName = this.eventName

      return events.map(event => {
        const eventId = event.id
        const profileId = event.relationships.profile.data.id
        const timestamp = event.attributes.timestamp
        const eventProperties = event.attributes.event_properties
        const userEmail = profiles.find(profile => profile.id === profileId).attributes.email

        const config = {
          eventProperties,
          timestamp,
          eventName,
          userEmail,
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

    return {
      statusCode: 200,
      written: writtenEvents,
      eventName: this.eventName,
      metricId: this.metricId,
    }
  }

  async setMetricRelationship(metricId, eventName) {
    this.metricId = metricId
    this.eventName = eventName

    await this.database.setMetric(metricId, eventName)
    return true
  }

  // async createInvalidAccount(event) {
  //   const config = {
  //     metricId: event.metricId,
  //     eventId: event.eventId,
  //     eventName: event.eventName,
  //     profileId: event.profileId,
  //     userEmail: event.userEmail || 'No email provided',
  //     fetchedEvent: event.fetchedEvent,
  //   }

  //   await this.database.insertInvalid(config)
  // }

  createEventObject(config) {
    const { eventProperties, timestamp, eventName, userEmail } = config
    return {
      data: {
        type: 'event',
        attributes: {
          eventProperties,
          timestamp,
          metric: {
            data: {
              type: 'metric',
              attributes: {
                eventName,
              },
            },
          },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                userEmail,
              },
            },
          },
        },
      },
    }
  }
}

export default DataProcessor