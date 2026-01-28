import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import fs from 'node:fs'
import path from 'node:path'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({ ok: true, time: new Date().toISOString() })
})

if (process.env.NODE_ENV === 'production') {
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

const port = Number(process.env.PORT ?? 8787)

serve({ fetch: app.fetch, port })

console.log(`Hono API listening on http://localhost:${port}`)