import { validateParams, getDuration, convertToDate } from '#utils/utility-functions'
import { createServerReply } from '#utils/format-data'
import { DatabaseError, RequestError } from '#utils/custom-errors'
import DataFetcher from '#controllers/DataFetcher'
import DataPublisher from '#controllers/DataPublisher'

const RequestProcessingRoute = async (fastify, options) => {
  const { services } = options
  const { logger, mailer } = services
  
  fastify.post('/request', async (request, reply) => {
    // General use data
    const startTime = Date.now()
    let statusCode = 200
    let replyInfo = { message: 'empty' }

    // Validate request parameters
    const validation = validateParams(request.query)
    if ( !validation.validate ) return reply.code(400).send(validation)

    // Get Axios instances
    const { accountNames, lookback } = validation
    let fetchAxios = services.get(accountNames.fetch)
    let publishAxios = services.get(accountNames.publish)
    if ( !fetchAxios || !publishAxios ) return reply.code(500).send({ error: 'Axios instance does not exist' })

    // Register services
    services.register('requestdetails', {
      fetchClient: fetchAxios.defaults.accountName,
      publishClient: publishAxios.defaults.accountName,
      lookback,
      metricId: request.query.metric_id
    })

    // Fetch from Klaviyo account and write to database
    try {
      let fetcher = new DataFetcher(fetchAxios, services)
      let fetchResponse = await fetcher.initFetch()
      fetcher = null
      fetchAxios = null
      if ( fetchResponse.statusCode === 204 ) {
        statusCode = 200
        replyInfo = createServerReply({ ...fetchResponse, duration: getDuration(startTime) })
      }
    } catch (error) {
      const errorType = error.constructor.name
      console.log('REQUESTENTRYROUTE: ERROR - DataFetcher', error)
    }

    // Fetch new events from database and publish to Klaviyo account
    try {
      const publisher = new DataPublisher(publishAxios, services)
      const publisherResponse = await publisher.initPublish()
      statusCode = publisherResponse.statusCode
      replyInfo = createServerReply({ ...publisherResponse, duration: getDuration(startTime) })
    } catch (error) {
      const errorType = error.constructor.name
      console.log('REQUESTENTRYROUTE: ERROR - DataPublisher', error)
    }

    reply.code(statusCode).send(replyInfo)
  })
}

export default RequestProcessingRoute