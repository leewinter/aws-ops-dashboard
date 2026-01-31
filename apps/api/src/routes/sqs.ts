import type { Hono } from 'hono'
import { env } from '../config/env'
import { logger } from '../lib/logger'
import { listQueues, peekMessages } from '../lib/sqs'

export function registerSqsRoutes(app: Hono) {
  app.get('/api/sqs/enabled', (c) => {
    return c.json({
      enabled: env.enableSqsViewer,
      defaultQueueUrl: env.sqsDefaultQueueUrl ?? null,
      region: env.awsRegion ?? null
    })
  })

  app.get('/api/sqs/queues', async (c) => {
    if (!env.enableSqsViewer) {
      return c.json({ ok: false }, 404)
    }
    try {
      const queues = await listQueues()
      return c.json({ ok: true, queues })
    } catch (error) {
      logger.error('[sqs] list queues failed', error)
      return c.json({ ok: false, message: 'Failed to list queues.' }, 500)
    }
  })

  app.get('/api/sqs/messages', async (c) => {
    if (!env.enableSqsViewer) {
      return c.json({ ok: false }, 404)
    }
    const queueUrl = c.req.query('queueUrl') ?? env.sqsDefaultQueueUrl
    if (!queueUrl) {
      return c.json({ ok: false, message: 'queueUrl is required.' }, 400)
    }
    const maxNumber = c.req.query('maxNumber')
    const waitSeconds = c.req.query('waitSeconds')

    try {
      const messages = await peekMessages({
        queueUrl,
        maxNumber: maxNumber ? Number(maxNumber) : undefined,
        waitSeconds: waitSeconds ? Number(waitSeconds) : undefined
      })
      return c.json({ ok: true, messages })
    } catch (error) {
      logger.error('[sqs] fetch messages failed', error)
      return c.json({ ok: false, message: 'Failed to fetch messages.' }, 500)
    }
  })
}
