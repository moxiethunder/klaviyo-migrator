import { PrismaClient } from '@prisma/client'

class DatabaseController {
  constructor() {
    this.prisma = new PrismaClient({ errorFormat: 'pretty' })
  }

  async updateImportStatus(eventId) {
    await this.prisma.event.update({
      where: {
        eventId
      },
      data: {
        imported: true
      }
    })
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
    const isUnique = await this.checkUniqueness('dump', 'uniqueId', uniqueId)

    await this.prisma.dump.upsert({
      where: { uniqueId },
      update: {},
      create: {
        uniqueId,
        metricId,
        eventName,
        requestData: JSON.stringify(requestData)
      }
    })

    return isUnique
  }

  async getDataByMetricRelationship(metricId, relationship) {
    return await this.prisma.metric.findUnique({
      where: {
        metricId
      },
      include: {
        [relationship]: true
      }
    })
  }

  async createEvent(config, table) {
    await this.prisma[table].upsert({
      where: { eventId: config.eventId },
      update: {},
      create: {
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

  async checkUniqueness(table, column, value) {
    const record = await this.prisma[table].findUnique({
      where: {
        [column]: value
      }
    })

    return record ? false : true
  }

  async countRows(table) {
    return await this.prisma[table].count()
  }
}

export default DatabaseController