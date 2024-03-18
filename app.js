import Fastify from 'fastify'
import 'dotenv/config'

import RequestProcessingRoute from '#routes/RequestProcessingRoute'
import ContinueProcessingRoute from '#routes/ContinueProcessingRoute'

import ServiceContainer from '#services/ServiceContainer'
import DatabaseController from '#services/DatabaseController'
import DataProcessor from '#controllers/DataProcessor'
import CreateAxios from '#services/CreateAxios'
import Mailer from '#services/Mailer'
import Logger from '#services/Logger'

const app = Fastify({ logger: process.env.NODE_ENV === 'development' })

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'

const BASE_URL = process.env.KLAVIYO_BASE_URL
const MAUNALOA_KEY = process.env.MAUNALOA_API_KEY
const HAWAIIANHOST_KEY = process.env.HAWAIIANHOST_API_KEY
const CODEMINTS_KEY = process.env.CODEMINTS_API_KEY

const MAILER_HOST = process.env.NODE_MAILER_HOST
const MAILER_PORT = process.env.NODE_MAILER_PORT
const MAILER_USER = process.env.NODE_MAILER_USER
const MAILER_PASS = process.env.NODE_MAILER_PASS

const mailerConfig = {
  host: MAILER_HOST,
  port: MAILER_PORT,
  secure: MAILER_PORT === "465",
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS
  }
}

const Services = new ServiceContainer()
const Database = new DatabaseController()
const Processor = new DataProcessor(Database)

const AxiosMaunaLoa = new CreateAxios(BASE_URL, MAUNALOA_KEY, 'Mauna Loa').create()
const AxiosHawaiianHost = new CreateAxios(BASE_URL, HAWAIIANHOST_KEY, 'Hawaiian Host').create()
const AxiosCodemints = new CreateAxios(BASE_URL, CODEMINTS_KEY, 'Codemints').create()

const MailerService = new Mailer(mailerConfig)
const LoggerService = new Logger()

const services = [
  { name: 'database', instance: Database },
  { name: 'processor', instance: Processor },
  { name: 'maunaloa', instance: AxiosMaunaLoa },
  { name: 'hawaiianhost', instance: AxiosHawaiianHost },
  { name: 'codemints', instance: AxiosCodemints },
  { name: 'mailer', instance: MailerService },
  { name: 'logger', instance: LoggerService }
]

services.forEach(service => { Services.register(service.name, service.instance) })

app.register(RequestProcessingRoute, { services: Services })
app.register(ContinueProcessingRoute, { services: Services })

const startServer = () => {
  try {
    app.listen({ port: PORT, host: HOST }, (error, address) => {
      if (error) {
        app.log.error(error)
        process.exit(1)
      }
      app.log.info(`Server listening on ${address}`)
    });
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

app.ready(() => {
  startServer()
})