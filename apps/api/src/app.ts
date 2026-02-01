import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { getCookie } from 'hono/cookie'
import fs from 'node:fs'
import path from 'node:path'
import { env } from './config/env'
import { getSession, pruneExpired } from './auth/service'
import { registerAuthRoutes } from './routes/auth'
import { registerCloudWatchRoutes } from './routes/cloudwatch'
import { registerHealthRoutes } from './routes/health'
import { registerLogRoutes } from './routes/logs'
import { registerSqsRoutes } from './routes/sqs'

export function createApp() {
  const app = new Hono()

  const publicApiPaths = new Set([
    '/api/health',
    '/api/auth/request',
    '/api/auth/verify',
    '/api/auth/logout',
    '/api/logs/enabled',
    '/api/cloudwatch/enabled',
    '/api/sqs/enabled'
  ])

  app.use('/api/*', async (c, next) => {
    if (publicApiPaths.has(c.req.path)) {
      return next()
    }
    pruneExpired()
    const sessionId = getCookie(c, 'session')
    if (!sessionId) {
      return c.json({ ok: false, message: 'Unauthorized' }, 401)
    }
    const session = getSession(sessionId)
    if (!session) {
      return c.json({ ok: false, message: 'Unauthorized' }, 401)
    }
    return next()
  })

  registerHealthRoutes(app)
  registerLogRoutes(app)
  registerCloudWatchRoutes(app)
  registerSqsRoutes(app)
  registerAuthRoutes(app)

  if (env.nodeEnv === 'production') {
    const staticRoot = path.resolve(__dirname, '../../web/dist')
    const staticHandler = serveStatic({ root: staticRoot })

    app.use('/*', async (c, next) => {
      if (c.req.path.startsWith('/api')) {
        return next()
      }
      return staticHandler(c, next)
    })

    app.get('*', (c) => {
      if (c.req.path.startsWith('/api')) {
        return c.notFound()
      }
      const indexPath = path.join(staticRoot, 'index.html')
      return c.html(fs.readFileSync(indexPath, 'utf-8'))
    })
  }

  return app
}
