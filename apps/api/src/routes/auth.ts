import type { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import nodemailer from 'nodemailer'
import { env } from '../config/env'
import { logger } from '../lib/logger'
import {
  consumeMagicToken,
  createMagicToken,
  createSession,
  deleteSession,
  getSession,
  isAllowedEmail,
  isEmail,
  pruneExpired
} from '../auth/service'

const transporter =
  env.smtpHost && env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: { user: env.smtpUser, pass: env.smtpPass }
      })
    : null

if (transporter) {
  transporter
    .verify()
    .then(() => {
      logger.info('[smtp] transporter verified')
    })
    .catch((error) => {
      logger.error('[smtp] transporter verify failed', error)
    })
} else {
  logger.warn('[smtp] transporter not configured; magic links will be logged')
}

export function registerAuthRoutes(app: Hono) {
  app.get('/api/me', (c) => {
    pruneExpired()
    const sessionId = getCookie(c, 'session')
    if (!sessionId) return c.json({ user: null })
    const session = getSession(sessionId)
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
      if (env.showAllowlistError) {
        return c.json({ ok: false, message: 'Email is not registered.' }, 403)
      }
      return c.json({ ok: true })
    }

    const token = createMagicToken(email)
    const origin = env.appOrigin ?? new URL(c.req.url).origin
    const magicUrl = new URL('/magic', origin)
    magicUrl.searchParams.set('token', token)

    if (transporter) {
      try {
        const html = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#f6f7fb; padding:32px;">
            <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; padding:28px; box-shadow:0 12px 30px rgba(15,23,42,0.08);">
              <h1 style="margin:0 0 12px; font-size:22px; color:#111827;">Sign in to Integration Layer</h1>
              <p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:#4b5563;">
                Use the button below to sign in. This link expires in about 15 minutes and can only be used once.
              </p>
              <a href="${magicUrl.toString()}" style="display:inline-block; padding:12px 20px; background:#111827; color:#ffffff; text-decoration:none; border-radius:999px; font-size:15px;">
                Sign in
              </a>
              <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0; font-size:13px; color:#2563eb; word-break:break-all;">
                ${magicUrl.toString()}
              </p>
            </div>
          </div>
        `

        const info = await transporter.sendMail({
          from: env.smtpFrom,
          to: email,
          subject: 'Your magic sign-in link',
          text: `Use this link to sign in (expires in 15 minutes): ${magicUrl.toString()}`,
          html
        })
        logger.info(
          '[smtp] sendMail ok ' +
            JSON.stringify({
              messageId: info.messageId,
              response: info.response
            })
        )
      } catch (error) {
        logger.error('[smtp] sendMail failed', error)
      }
    } else {
      logger.info(`[magic-link] ${email} -> ${magicUrl.toString()}`)
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

    const record = consumeMagicToken(token)
    if (!record) {
      return c.json({ ok: false }, 400)
    }

    if (!isAllowedEmail(record.email)) {
      return c.json({ ok: false }, 403)
    }

    const sessionId = createSession(record.email)

    setCookie(c, 'session', sessionId, {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: Math.floor(env.sessionTtlMs / 1000),
      secure: env.nodeEnv === 'production'
    })

    return c.json({ ok: true, user: { email: record.email } })
  })

  app.post('/api/auth/logout', (c) => {
    const sessionId = getCookie(c, 'session')
    if (sessionId) deleteSession(sessionId)
    deleteCookie(c, 'session', { path: '/' })
    return c.json({ ok: true })
  })
}
