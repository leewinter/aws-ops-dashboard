import type { Hono } from 'hono'
import { getUserStatus } from '../auth/service'

export function registerUserRoutes(app: Hono) {
  app.get('/api/users/status', (c) => {
    const users = getUserStatus()
    return c.json({ ok: true, users })
  })
}
