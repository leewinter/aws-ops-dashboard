import { serve } from '@hono/node-server'
import { env } from './config/env'
import { logger } from './lib/logger'
import { createApp } from './app'

const app = createApp()

serve({ fetch: app.fetch, port: env.port })

logger.info(`Hono API listening on http://localhost:${env.port}`)
