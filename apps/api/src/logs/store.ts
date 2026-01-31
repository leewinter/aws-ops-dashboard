import type { SSEStreamingApi } from 'hono/streaming'
import { env } from '../config/env'

export type LogEntry = {
  id: number
  ts: number
  level: string
  message: string
}

const logBuffer: LogEntry[] = []
let logCounter = 0
const logSubscribers = new Set<SSEStreamingApi>()

export function isLogViewerEnabled() {
  return env.enableLogViewer
}

export function getLogBuffer() {
  return logBuffer
}

export function addLogSubscriber(subscriber: SSEStreamingApi) {
  logSubscribers.add(subscriber)
}

export function removeLogSubscriber(subscriber: SSEStreamingApi) {
  logSubscribers.delete(subscriber)
}

export function pushLog(level: string, message: string) {
  if (!env.enableLogViewer) return
  const entry: LogEntry = {
    id: ++logCounter,
    ts: Date.now(),
    level,
    message
  }
  logBuffer.push(entry)
  if (logBuffer.length > env.logBufferSize) {
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
