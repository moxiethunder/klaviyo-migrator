import { DatabaseError, RequestError } from '#utils/custom-errors'
import { validateEmail } from '#utils/utility-functions'

class DataProcessor {
  constructor(database) {
    this.database = database
    this.eventName = null
    this.metricId = null
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

  async writeFetchedEvents() {
    const metricSearch = await this.database.getDataByMetricRelationship(this.metricId, 'dumps')
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
        const timestamp = event.attributes.datetime
        const eventProperties = event.attributes.event_properties
        const userEmail = profiles.find(profile => profile.id === profileId)?.attributes?.email || 'unknown'

        console.log(userEmail)

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
  }

  async setMetricRelationship(metricId, eventName) {
    this.metricId = metricId
    this.eventName = eventName

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