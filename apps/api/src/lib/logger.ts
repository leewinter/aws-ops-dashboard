import winston from 'winston'
import { Writable } from 'node:stream'
import { env } from '../config/env'
import { pushLog } from '../logs/store'

const logViewerStream = new Writable({
  write(chunk, _encoding, callback) {
    if (!env.enableLogViewer) {
      callback()
      return
    }
    const message = chunk.toString().trim()
    if (!message) {
      callback()
      return
    }
    try {
      const parsed = JSON.parse(message) as { level?: string; message?: string }
      const level = parsed.level ?? 'info'
      const msg = parsed.message ?? message
      pushLog(level, msg)
    } catch {
      pushLog('info', message)
    }
    callback()
  }
})

const logViewerTransport = env.enableLogViewer
  ? new winston.transports.Stream({ stream: logViewerStream })
  : null

export const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`
        })
      )
    }),
    ...(logViewerTransport ? [logViewerTransport] : [])
  ]
})
