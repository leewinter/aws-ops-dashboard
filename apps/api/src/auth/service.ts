import crypto from 'node:crypto'
import { env } from '../config/env'

type MagicToken = {
  email: string
  expiresAt: number
}

type Session = {
  email: string
  expiresAt: number
}

const tokens = new Map<string, MagicToken>()
const sessions = new Map<string, Session>()

function randomToken(size = 32) {
  return crypto.randomBytes(size).toString('hex')
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isAllowedEmail(email: string) {
  if (env.allowedEmails.length === 0) return true
  return env.allowedEmails.includes(email.toLowerCase())
}

export function pruneExpired() {
  const now = Date.now()
  for (const [token, data] of tokens.entries()) {
    if (data.expiresAt <= now) tokens.delete(token)
  }
  for (const [id, data] of sessions.entries()) {
    if (data.expiresAt <= now) sessions.delete(id)
  }
}

export function createMagicToken(email: string) {
  const token = randomToken(24)
  const tokenHash = hashToken(token)
  tokens.set(tokenHash, { email, expiresAt: Date.now() + env.tokenTtlMs })
  return token
}

export function consumeMagicToken(token: string) {
  const tokenHash = hashToken(token)
  const record = tokens.get(tokenHash)
  if (!record || record.expiresAt < Date.now()) {
    tokens.delete(tokenHash)
    return null
  }
  tokens.delete(tokenHash)
  return record
}

export function createSession(email: string) {
  const sessionId = randomToken(24)
  sessions.set(sessionId, {
    email,
    expiresAt: Date.now() + env.sessionTtlMs
  })
  return sessionId
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId) ?? null
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId)
}
