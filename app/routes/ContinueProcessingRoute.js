import { getDuration, getSecondsPassed } from '#utils/utility-functions'
import DataPublisher from '#controllers/DataPublisher'

const ContinueProcessingRoute = async (fastify, options) => {
  const { services } = options

  fastify.post('/continue', async (request, reply) => {
    if ( !request.query.metric_id ) return reply.code(400).send({ error: 'Missing metric_id' })

    const startTime = Date.now()
    let statusCode = 200
    let replyInfo = { message: 'empty' }

    const processor = services.get('processor')

    // get export name from dump
    const details = await processor.getDumpDetails(request.query.metric_id)
    const { fetchClient, publishClient } = details
    const httpClient = services.get(fetchClient)
    const fetchClientName = services.get(publishClient).defaults.accountName

    services.register('requestdetails', {
      fetchClient: fetchClientName,
      publishClient: httpClient.defaults.accountName,
      metricId: request.query.metric_id,
      lookback: getSecondsPassed('2024-05-01')
    })

    const writeFetchedEvents = await processor.writeFetchedEvents()
    const publisher = new DataPublisher(httpClient, services)
    const publisherResponse = await publisher.initPublish()
  })
}

export default ContinueProcessingRoute