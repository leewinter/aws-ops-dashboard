import dotenv from 'dotenv'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { streamSSE } from 'hono/streaming'
import nodemailer from 'nodemailer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

type MagicToken = {
  email: string
  expiresAt: number
}

type Session = {
  email: string
  expiresAt: number
}

type LogEntry = {
  id: number
  ts: number
  level: string
  message: string
}

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env')
]

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    break
  }
}

const app = new Hono()
const tokens = new Map<string, MagicToken>()
const sessions = new Map<string, Session>()

const TOKEN_TTL_MS = Number(process.env.TOKEN_TTL_MS ?? 15 * 60 * 1000)
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS ?? 7 * 24 * 60 * 60 * 1000)
const ENABLE_LOG_VIEWER = process.env.ENABLE_LOG_VIEWER === 'true'
const LOG_BUFFER_SIZE = Number(process.env.LOG_BUFFER_SIZE ?? 500)

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT ?? 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM ?? 'no-reply@localhost'
const appOrigin = process.env.APP_ORIGIN
const allowedEmails = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)
const showAllowlistError = process.env.SHOW_ALLOWLIST_ERROR === 'true'

const logBuffer: LogEntry[] = []
let logCounter = 0
const logSubscribers = new Set<import('hono/streaming').SSEStreamingApi>()

function formatLogArg(value: unknown) {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function pushLog(level: string, args: unknown[]) {
  if (!ENABLE_LOG_VIEWER) return
  const entry: LogEntry = {
    id: ++logCounter,
    ts: Date.now(),
    level,
    message: args.map(formatLogArg).join(' ')
  }
  logBuffer.push(entry)
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift()
  }
  for (const subscriber of logSubscribers) {
    subscriber
      .writeSSE({
        event: 'log',
        id: String(entry.id),
        data: JSON.stringify(entry)
      })
      .catch(() => {
        logSubscribers.delete(subscriber)
      })
  }
}

if (ENABLE_LOG_VIEWER) {
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  }

  console.log = (...args: unknown[]) => {
    pushLog('log', args)
    original.log(...args)
  }
  console.info = (...args: unknown[]) => {
    pushLog('info', args)
    original.info(...args)
  }
  console.warn = (...args: unknown[]) => {
    pushLog('warn', args)
    original.warn(...args)
  }
  console.error = (...args: unknown[]) => {
    pushLog('error', args)
    original.error(...args)
  }
  console.debug = (...args: unknown[]) => {
    pushLog('debug', args)
    original.debug(...args)
  }
}

const transporter =
  smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
      })
    : null

if (transporter) {
  transporter
    .verify()
    .then(() => {
      console.log('[smtp] transporter verified')
    })
    .catch((error) => {
      console.error('[smtp] transporter verify failed', error)
    })
} else {
  console.warn('[smtp] transporter not configured; magic links will be logged')
}

function randomToken(size = 32) {
  return crypto.randomBytes(size).toString('hex')
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isAllowedEmail(email: string) {
  if (allowedEmails.length === 0) return true
  return allowedEmails.includes(email.toLowerCase())
}

function pruneExpired() {
  const now = Date.now()
  for (const [token, data] of tokens.entries()) {
    if (data.expiresAt <= now) tokens.delete(token)
  }
  for (const [id, data] of sessions.entries()) {
    if (data.expiresAt <= now) sessions.delete(id)
  }
}

app.get('/api/health', (c) => {
  return c.json({ ok: true, time: new Date().toISOString() })
})

app.get('/api/logs/enabled', (c) => {
  return c.json({ enabled: ENABLE_LOG_VIEWER })
})

app.get('/api/logs/stream', (c) => {
  if (!ENABLE_LOG_VIEWER) {
    return c.json({ ok: false }, 404)
  }
  return streamSSE(c, async (stream) => {
    logSubscribers.add(stream)
    stream.onAbort(() => {
      logSubscribers.delete(stream)
    })

    for (const entry of logBuffer) {
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

app.get('/api/me', (c) => {
  pruneExpired()
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ user: null })
  const session = sessions.get(sessionId)
  if (!session) return c.json({ user: null })
  return c.json({ user: { email: session.email } })
})

app.post('/api/auth/request', async (c) => {
  pruneExpired()
  const body = await c.req.json().catch(() => null)
  const email = body?.email?.toString().trim().toLowerCase()

  if (!email || !isEmail(email)) {
    return c.json({ ok: true })
  }

  if (!isAllowedEmail(email)) {
    if (showAllowlistError) {
      return c.json(
        { ok: false, message: 'Email is not registered.' },
        403
      )
    }
    return c.json({ ok: true })
  }

  const token = randomToken(24)
  const tokenHash = hashToken(token)
  tokens.set(tokenHash, { email, expiresAt: Date.now() + TOKEN_TTL_MS })

  const origin = appOrigin ?? new URL(c.req.url).origin
  const magicUrl = new URL('/magic', origin)
  magicUrl.searchParams.set('token', token)

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'Your magic sign-in link',
        text: `Use this link to sign in: ${magicUrl.toString()}`,
        html: `<p>Use this link to sign in:</p><p><a href="${magicUrl.toString()}">${magicUrl.toString()}</a></p>`
      })
      console.log('[smtp] sendMail ok', {
        messageId: info.messageId,
        response: info.response
      })
    } catch (error) {
      console.error('[smtp] sendMail failed', error)
    }
  } else {
    console.log(`[magic-link] ${email} -> ${magicUrl.toString()}`)
  }

  return c.json({ ok: true })
})

app.post('/api/auth/verify', async (c) => {
  pruneExpired()
  const body = await c.req.json().catch(() => null)
  const token = body?.token?.toString()

  if (!token) {
    return c.json({ ok: false }, 400)
  }

  const record = tokens.get(hashToken(token))
  if (!record || record.expiresAt < Date.now()) {
    tokens.delete(hashToken(token))
    return c.json({ ok: false }, 400)
  }

  if (!isAllowedEmail(record.email)) {
    tokens.delete(hashToken(token))
    return c.json({ ok: false }, 403)
  }

  tokens.delete(hashToken(token))
  const sessionId = randomToken(24)
  sessions.set(sessionId, {
    email: record.email,
    expiresAt: Date.now() + SESSION_TTL_MS
  })

  setCookie(c, 'session', sessionId, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === 'production'
  })

  return c.json({ ok: true, user: { email: record.email } })
})

app.post('/api/auth/logout', (c) => {
  const sessionId = getCookie(c, 'session')
  if (sessionId) sessions.delete(sessionId)
  deleteCookie(c, 'session', { path: '/' })
  return c.json({ ok: true })
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
