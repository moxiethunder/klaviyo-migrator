import { PrismaClient } from '@prisma/client'

class DatabaseClient {
  constructor() {
    this.client = new PrismaClient()
  }
}

export default DatabaseClient