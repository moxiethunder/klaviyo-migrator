import { DatabaseError, RequestError } from '#utils/custom-errors'

class DataProcessor {
  constructor(database) {
    this.database = database
    this.eventName = null
    this.metricId = null
  }

  async dataDump(data) {
    const uniqueId = data.data[0].id
    await this.database.insertDump(uniqueId, this.metricId, this.eventName, data)
  }

  async createEvent() {

  }

  async setMetricRelationship(metricId, eventName) {
    this.metricId = metricId
    this.eventName = eventName
  }
}

export default DataProcessor