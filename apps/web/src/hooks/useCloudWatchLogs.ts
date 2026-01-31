import { useCallback, useEffect, useMemo, useState } from 'react'

export type CloudWatchEvent = {
  eventId?: string
  ingestionTime?: number
  timestamp?: number
  message?: string
  logStreamName?: string
}

type EnabledResponse = {
  enabled: boolean
  defaultLogGroup: string | null
  region: string | null
}

export function useCloudWatchLogs() {
  const [enabled, setEnabled] = useState(false)
  const [region, setRegion] = useState<string | null>(null)
  const [defaultLogGroup, setDefaultLogGroup] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<CloudWatchEvent[]>([])
  const [nextToken, setNextToken] = useState<string | null>(null)
  const [logGroups, setLogGroups] = useState<string[]>([])
  const [isListing, setIsListing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/cloudwatch/enabled')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EnabledResponse | null) => {
        if (!data) return
        setEnabled(Boolean(data.enabled))
        setDefaultLogGroup(data.defaultLogGroup)
        setRegion(data.region)
      })
      .catch(() => {
        setEnabled(false)
      })
  }, [])

  const loadLogGroups = useCallback(async () => {
    setIsListing(true)
    setListError(null)
    const collected: string[] = []
    let token: string | null = null

    try {
      do {
        const query = new URLSearchParams()
        if (token) query.set('nextToken', token)
        const res = await fetch(`/api/cloudwatch/log-groups?${query.toString()}`)
        const payload = (await res.json()) as
          | { ok: boolean; logGroups?: { logGroupName?: string }[]; nextToken?: string; message?: string }
          | null
        if (!res.ok || !payload?.ok) {
          setListError(payload?.message ?? 'Failed to list log groups.')
          break
        }
        const names = (payload.logGroups ?? [])
          .map((group) => group.logGroupName)
          .filter(Boolean) as string[]
        collected.push(...names)
        token = payload.nextToken ?? null
      } while (token)

      setLogGroups(collected)
    } catch {
      setListError('Failed to list log groups.')
    } finally {
      setIsListing(false)
    }
  }, [])

  const loadLogs = useCallback(
    async (params: {
      logGroupName: string
      logStreamNames?: string[]
      startTime?: number
      endTime?: number
      limit?: number
      filterPattern?: string
      append?: boolean
    }) => {
      setIsLoading(true)
      setError(null)

      const query = new URLSearchParams()
      query.set('logGroupName', params.logGroupName)
      if (params.logStreamNames?.length) {
        query.set('logStreamNames', params.logStreamNames.join(','))
      }
      if (params.startTime) query.set('startTime', String(params.startTime))
      if (params.endTime) query.set('endTime', String(params.endTime))
      if (params.limit) query.set('limit', String(params.limit))
      if (params.filterPattern) query.set('filterPattern', params.filterPattern)
      if (params.append && nextToken) query.set('nextToken', nextToken)

      try {
        const res = await fetch(`/api/cloudwatch/logs?${query.toString()}`)
        const payload = (await res.json()) as
          | { ok: boolean; events?: CloudWatchEvent[]; nextToken?: string; message?: string }
          | null
        if (!res.ok || !payload?.ok) {
          setError(payload?.message ?? 'Failed to fetch logs.')
          return
        }
        setNextToken(payload.nextToken ?? null)
        setEvents((prev) =>
          params.append ? [...prev, ...(payload.events ?? [])] : payload.events ?? []
        )
      } catch {
        setError('Failed to fetch logs.')
      } finally {
        setIsLoading(false)
      }
    },
    [nextToken]
  )

  const meta = useMemo(
    () => ({
      enabled,
      region,
      defaultLogGroup
    }),
    [enabled, region, defaultLogGroup]
  )

  return {
    ...meta,
    isLoading,
    error,
    events,
    nextToken,
    loadLogs,
    logGroups,
    loadLogGroups,
    isListing,
    listError
  }
}
