import { validateParams, getDuration, convertToDate } from '#utils/utility-functions'
import { createServerReply } from '#utils/format-data'

import DataFetcher from '#controllers/DataFetcher'
import DataPublisher from '#controllers/DataPublisher'

const RequestEntryRoute = async (fastify, options) => {
  const { Services } = options
  
  fastify.post('/request-entry', async (request, reply) => {
    const startTime = Date.now()

    const validation = validateParams(request.query)
    if ( !validation.validate ) return reply.code(400).send(validation)

    const { accountNames, lookback } = validation
    const fetchAxios = Services.get(accountNames.fetch)
    const publishAxios = Services.get(accountNames.publish)
    if ( !fetchAxios || !publishAxios ) return reply.code(500).send({ error: 'Axios instance does not exist' })

    Services.register('requestdetails', {
      fetchClient: fetchAxios.defaults.accountName,
      publishClient: publishAxios.defaults.accountName,
      lookback,
      metricId: request.query.metric_id
    })

    try {
      const fetcher = new DataFetcher(fetchAxios, Services)
      const fetchResponse = await fetcher.fetchData()
    } catch (error) {
      // console.log('Axios error: ', error.response?.data?.errors[0].detail)
    }


    reply.code(200).send({ message: 'Request completed', duration: getDuration(startTime)})
  })
}

export default RequestEntryRoute