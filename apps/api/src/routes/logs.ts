import { streamSSE } from 'hono/streaming'
import type { Hono } from 'hono'
import {
  addLogSubscriber,
  getLogBuffer,
  isLogViewerEnabled,
  removeLogSubscriber
} from '../logs/store'

export function registerLogRoutes(app: Hono) {
  app.get('/api/logs/enabled', (c) => {
    return c.json({ enabled: isLogViewerEnabled() })
  })

  app.get('/api/logs/stream', (c) => {
    if (!isLogViewerEnabled()) {
      return c.json({ ok: false }, 404)
    }
    return streamSSE(c, async (stream) => {
      addLogSubscriber(stream)
      stream.onAbort(() => {
        removeLogSubscriber(stream)
      })

      for (const entry of getLogBuffer()) {
        await stream.writeSSE({
          event: 'log',
          id: String(entry.id),
          data: JSON.stringify(entry)
        })
      }

      while (!stream.aborted && !stream.closed) {
        await stream.writeSSE({
          event: 'ping',
          data: String(Date.now())
        })
        await stream.sleep(15000)
      }
    })
  })
}
