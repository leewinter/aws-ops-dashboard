import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import fs from 'node:fs'
import path from 'node:path'
import { env } from './config/env'
import { registerAuthRoutes } from './routes/auth'
import { registerCloudWatchRoutes } from './routes/cloudwatch'
import { registerHealthRoutes } from './routes/health'
import { registerLogRoutes } from './routes/logs'

export function createApp() {
  const app = new Hono()

  registerHealthRoutes(app)
  registerLogRoutes(app)
  registerCloudWatchRoutes(app)
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
