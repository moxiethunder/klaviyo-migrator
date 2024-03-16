import { validateParams, getDuration, convertToDate } from '#utils/utility-functions'
import { createServerReply } from '#utils/format-data'
import { DatabaseError, RequestError } from '#utils/custom-errors'
import DataFetcher from '#controllers/DataFetcher'
import DataPublisher from '#controllers/DataPublisher'

const RequestEntryRoute = async (fastify, options) => {
  const { services } = options
  const { logger, mailer } = options.services
  
  fastify.post('/request-entry', async (request, reply) => {
    const startTime = Date.now()

    const validation = validateParams(request.query)
    if ( !validation.validate ) return reply.code(400).send(validation)

    const { accountNames, lookback } = validation
    const fetchAxios = services.get(accountNames.fetch)
    const publishAxios = services.get(accountNames.publish)
    if ( !fetchAxios || !publishAxios ) return reply.code(500).send({ error: 'Axios instance does not exist' })

    services.register('requestdetails', {
      fetchClient: fetchAxios.defaults.accountName,
      publishClient: publishAxios.defaults.accountName,
      lookback,
      metricId: request.query.metric_id
    })

    try {
      const fetcher = new DataFetcher(fetchAxios, services)
      const fetchResponse = await fetcher.fetchData()
      if ( fetchResponse.statusCode === 204 ) {
        const replyInfo = createServerReply({ ...fetchResponse, duration: getDuration(startTime) })
        reply.code(200).send(replyInfo)
      }
    } catch (error) {
      console.log('Error: RequestEntryRoute', error)
    }
  })
}

export default RequestEntryRoute