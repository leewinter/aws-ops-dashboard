import { useCallback, useEffect, useRef, useState } from 'react'

export type LogEntry = {
  id: number
  ts: number
  level: string
  message: string
}

const MAX_LOGS = 500

export function useLogStream() {
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const sourceRef = useRef<EventSource | null>(null)

  const appendLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => {
      const next = [...prev, entry]
      if (next.length > MAX_LOGS) {
        next.shift()
      }
      return next
    })
  }, [])

  useEffect(() => {
    let isMounted = true
    fetch('/api/logs/enabled')
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .then((data) => {
        if (isMounted) setEnabled(Boolean(data.enabled))
      })
      .catch(() => {
        if (isMounted) setEnabled(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    setStatus('connecting')
    const source = new EventSource('/api/logs/stream')
    sourceRef.current = source

    source.addEventListener('open', () => {
      setStatus('connected')
    })

    source.addEventListener('log', (event) => {
      try {
        const parsed = JSON.parse((event as MessageEvent).data) as LogEntry
        appendLog(parsed)
      } catch {
        // ignore parse errors
      }
    })

    source.addEventListener('error', () => {
      setStatus('error')
    })

    return () => {
      source.close()
      sourceRef.current = null
    }
  }, [appendLog, enabled])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    enabled,
    logs,
    status,
    clearLogs
  }
}
