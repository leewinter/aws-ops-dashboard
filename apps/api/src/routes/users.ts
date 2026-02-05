import type { Hono } from 'hono'
import {
  addTempAllowed,
  getAllowedUsers,
  getUserStatus,
  isEmail,
  removeTempAllowed
} from '../auth/service'

export function registerUserRoutes(app: Hono) {
  app.get('/api/users/status', (c) => {
    const users = getUserStatus()
    return c.json({ ok: true, users })
  })

  app.get('/api/users/allowed', (c) => {
    const users = getAllowedUsers()
    return c.json({ ok: true, users })
  })

  app.post('/api/users/allowed', async (c) => {
    const body = await c.req.json().catch(() => null)
    const email = body?.email?.toString().trim().toLowerCase()
    if (!email || !isEmail(email)) {
      return c.json({ ok: false, message: 'Invalid email.' }, 400)
    }
    const result = addTempAllowed(email)
    if (!result.ok && result.reason === 'exists') {
      return c.json({ ok: false, message: 'Email already allowed.' }, 409)
    }
    return c.json({ ok: true })
  })

  app.delete('/api/users/allowed', (c) => {
    const email = c.req.query('email')?.toString().trim().toLowerCase()
    if (!email || !isEmail(email)) {
      return c.json({ ok: false, message: 'Invalid email.' }, 400)
    }
    const result = removeTempAllowed(email)
    if (!result.ok && result.reason === 'managed') {
      return c.json({ ok: false, message: 'Email is managed by env.' }, 409)
    }
    return c.json({ ok: true })
  })
}
