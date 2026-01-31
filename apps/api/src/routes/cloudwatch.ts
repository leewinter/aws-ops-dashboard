import type { Hono } from 'hono'
import { env } from '../config/env'
import { fetchCloudWatchLogs, listCloudWatchLogGroups } from '../lib/cloudwatch'
import { logger } from '../lib/logger'

export function registerCloudWatchRoutes(app: Hono) {
  app.get('/api/cloudwatch/enabled', (c) => {
    return c.json({
      enabled: env.enableCloudwatchViewer,
      defaultLogGroup: env.cloudwatchDefaultLogGroup ?? null,
      region: env.awsRegion ?? null
    })
  })

  app.get('/api/cloudwatch/log-groups', async (c) => {
    if (!env.enableCloudwatchViewer) {
      return c.json({ ok: false }, 404)
    }
    const nextToken = c.req.query('nextToken')
    const limit = c.req.query('limit')
    try {
      const result = await listCloudWatchLogGroups({
        nextToken: nextToken || undefined,
        limit: limit ? Number(limit) : undefined
      })
      return c.json({ ok: true, ...result })
    } catch (error) {
      logger.error('[cloudwatch] list groups failed', error)
      return c.json({ ok: false, message: 'Failed to list log groups.' }, 500)
    }
  })

  app.get('/api/cloudwatch/logs', async (c) => {
    if (!env.enableCloudwatchViewer) {
      return c.json({ ok: false }, 404)
    }

    const logGroupName =
      c.req.query('logGroupName') ?? env.cloudwatchDefaultLogGroup
    if (!logGroupName) {
      return c.json({ ok: false, message: 'logGroupName is required.' }, 400)
    }

    const logStreamNames = c.req.query('logStreamNames')
    const startTime = c.req.query('startTime')
    const endTime = c.req.query('endTime')
    const limit = c.req.query('limit')
    const filterPattern = c.req.query('filterPattern')
    const nextToken = c.req.query('nextToken')

    try {
      const result = await fetchCloudWatchLogs({
        logGroupName,
        logStreamNames: logStreamNames
          ? logStreamNames.split(',').map((name) => name.trim()).filter(Boolean)
          : undefined,
        startTime: startTime ? Number(startTime) : undefined,
        endTime: endTime ? Number(endTime) : undefined,
        limit: limit ? Number(limit) : undefined,
        filterPattern: filterPattern || undefined,
        nextToken: nextToken || undefined
      })

      return c.json({ ok: true, ...result })
    } catch (error) {
      logger.error('[cloudwatch] fetch failed', error)
      return c.json({ ok: false, message: 'Failed to fetch logs.' }, 500)
    }
  })
}
