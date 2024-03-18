import { PrismaClient } from '@prisma/client'
const Prisma = new PrismaClient()

async function updateCreatedSuccessCount() {
  try {
    const metrics = await Prisma.metric.findMany()

    for (const metric of metrics) {
      const eventCount = await Prisma.event.count({
        where: {
          metricId: metric.metricId
        }
      })

      await Prisma.metric.update({
        where: {
          metricId: metric.metricId
        },
        data: {
          success: eventCount
        }
      })
    }
  } catch (error) {
    console.error(error)
  }
}

updateCreatedSuccessCount()