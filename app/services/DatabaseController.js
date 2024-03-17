import { PrismaClient } from '@prisma/client'

class DatabaseController {
  constructor() {
    this.prisma = new PrismaClient({ errorFormat: 'pretty' })
  }

  async countRows(table) {
    return await this.prisma[table].count()
  }

  async setMetric(metricId, eventName) {
    await this.prisma.metric.upsert({
      where: { metricId },
      update: {},
      create: {
        metricId,
        eventName
      }
    })
  }

  async insertDump(uniqueId, metricId, eventName, requestData) {
    // const isUnique = await this.checkUniqueness('dump', 'uniqueId', uniqueId)

    await this.prisma.dump.create({
      data: {
        uniqueId,
        metricId,
        eventName,
        requestData: JSON.stringify(requestData)
      }
    })

    // await this.prisma.dump.upsert({
    //   where: { uniqueId },
    //   update: {},
    //   create: {
    //     uniqueId,
    //     metricId,
    //     eventName,
    //     requestData: JSON.stringify(requestData)
    //   }
    // })

    // return isUnique
  }

  async getDumpData(metricId) {
    return await this.prisma.metric.findUnique({
      where: {
        metricId
      },
      include: {
        dumps: true
      }
    })
  }

  async createEvent(config, table) {
    await this.prisma[table].create({
      data: {
        metricId: config.metricId,
        eventId: config.eventId,
        eventName: config.eventName,
        profileId: config.profileId,
        userEmail: config.userEmail,
        fetchedEvent: JSON.stringify(config.fetchedEvent),
        newEvent: JSON.stringify(config.newEvent)
      }
    })
  }

  async insertEvent(event) {
    // const isUnique = await this.checkUniqueness('event', 'eventId', event.eventId)

    await this.prisma.event.create({
      data: {
        metricId: event.metricId,
        eventId: event.eventId,
        eventName: event.eventName,
        profileId: event.profileId,
        userEmail: event.userEmail,
        fetchedEvent: JSON.stringify(event.fetchedEvent),
        newEvent: JSON.stringify(event.newEvent)
      }
    })

    // await this.prisma.event.upsert({
    //   where: { 
    //     eventId: event.eventId
    //   },
    //   update: {},
    //   create: {
    //     metricId: event.metricId,
    //     eventId: event.eventId,
    //     eventName: event.eventName,
    //     profileId: event.profileId,
    //     userEmail: event.userEmail,
    //     fetchedEvent: JSON.stringify(event.fetchedEvent),
    //     newEvent: JSON.stringify(event.newEvent)
    //   }
    // })

    // return isUnique
  }

  async checkUniqueness(table, column, value) {
    const record = await this.prisma[table].findUnique({
      where: {
        [column]: value
      }
    })

    return record ? false : true
  }
}

export default DatabaseController