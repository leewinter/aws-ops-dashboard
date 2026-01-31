import { useCallback, useEffect, useState } from 'react'

export type SqsMessage = {
  MessageId?: string
  ReceiptHandle?: string
  Body?: string
  Attributes?: Record<string, string>
  MessageAttributes?: Record<string, unknown>
}

type EnabledResponse = {
  enabled: boolean
  defaultQueueUrl: string | null
  region: string | null
}

export function useSqsMessages() {
  const [enabled, setEnabled] = useState(false)
  const [region, setRegion] = useState<string | null>(null)
  const [defaultQueueUrl, setDefaultQueueUrl] = useState<string | null>(null)
  const [queues, setQueues] = useState<string[]>([])
  const [isListing, setIsListing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [messages, setMessages] = useState<SqsMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sqs/enabled')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EnabledResponse | null) => {
        if (!data) return
        setEnabled(Boolean(data.enabled))
        setDefaultQueueUrl(data.defaultQueueUrl)
        setRegion(data.region)
      })
      .catch(() => {
        setEnabled(false)
      })
  }, [])

  const loadQueues = useCallback(async () => {
    setIsListing(true)
    setListError(null)
    try {
      const res = await fetch('/api/sqs/queues')
      const payload = (await res.json()) as
        | { ok: boolean; queues?: string[]; message?: string }
        | null
      if (!res.ok || !payload?.ok) {
        setListError(payload?.message ?? 'Failed to list queues.')
        return
      }
      setQueues(payload.queues ?? [])
    } catch {
      setListError('Failed to list queues.')
    } finally {
      setIsListing(false)
    }
  }, [])

  const loadMessages = useCallback(
    async (params: { queueUrl: string; maxNumber?: number; waitSeconds?: number }) => {
      setIsLoading(true)
      setError(null)
      const query = new URLSearchParams()
      query.set('queueUrl', params.queueUrl)
      if (params.maxNumber) query.set('maxNumber', String(params.maxNumber))
      if (params.waitSeconds) query.set('waitSeconds', String(params.waitSeconds))

      try {
        const res = await fetch(`/api/sqs/messages?${query.toString()}`)
        const payload = (await res.json()) as
          | { ok: boolean; messages?: SqsMessage[]; message?: string }
          | null
        if (!res.ok || !payload?.ok) {
          setError(payload?.message ?? 'Failed to fetch messages.')
          return
        }
        setMessages(payload.messages ?? [])
      } catch {
        setError('Failed to fetch messages.')
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    enabled,
    region,
    defaultQueueUrl,
    queues,
    isListing,
    listError,
    loadQueues,
    messages,
    isLoading,
    error,
    loadMessages
  }
}
