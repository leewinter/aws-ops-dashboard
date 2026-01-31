import { Button, Checkbox, Input } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLogStream } from '../../hooks/useLogStream'

type Props = {
  showSave?: boolean
  initialTailEnabled?: boolean
  initialLevels?: string[]
  initialQuery?: string
  onSaveWidget?: (config: {
    tailEnabled: boolean
    levels: string[]
    query: string
  }) => void
}

export default function LogViewer({
  showSave,
  initialTailEnabled = true,
  initialLevels = ['info', 'warn', 'error', 'debug'],
  initialQuery = '',
  onSaveWidget
}: Props) {
  const { enabled, logs, status, clearLogs } = useLogStream()
  const tailRef = useRef<HTMLDivElement | null>(null)
  const [flash, setFlash] = useState(false)
  const [tailEnabled, setTailEnabled] = useState(initialTailEnabled)
  const [levels, setLevels] = useState<string[]>(initialLevels)
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    if (tailEnabled) {
      tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    if (logs.length > 0) {
      setFlash(false)
      const frame = window.requestAnimationFrame(() => setFlash(true))
      const timer = window.setTimeout(() => setFlash(false), 650)
      return () => {
        window.cancelAnimationFrame(frame)
        window.clearTimeout(timer)
      }
    }
  }, [logs, tailEnabled])

  const filteredLogs = useMemo(() => {
    if (levels.length === 0) return []
    const allowed = new Set(levels)
    const normalized = query.trim().toLowerCase()
    return logs.filter((entry) => {
      if (!allowed.has(entry.level)) return false
      if (!normalized) return true
      return entry.message.toLowerCase().includes(normalized)
    })
  }, [levels, logs, query])

  if (!enabled) {
    return (
      <div className="log-viewer log-viewer--disabled">
        <h3>Log viewer</h3>
        <p>Log viewer is disabled. Set ENABLE_LOG_VIEWER=true to enable it.</p>
      </div>
    )
  }

  return (
    <div className={`log-viewer${flash ? ' log-viewer--flash' : ''}`}>
      <div className="log-viewer__header">
        <div>
          <h3>Log viewer</h3>
          <span className={`log-viewer__status log-viewer__status--${status}`}>
            {status}
          </span>
        </div>
        <div className="log-viewer__actions">
          <Input
            className="log-viewer__search"
            size="small"
            placeholder="Search logs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            allowClear
          />
          <Checkbox
            checked={tailEnabled}
            onChange={(event) => setTailEnabled(event.target.checked)}
          >
            Tail log
          </Checkbox>
          <Checkbox.Group
            className="log-viewer__levels"
            value={levels}
            options={['info', 'warn', 'error', 'debug']}
            onChange={(checked) => setLevels(checked as string[])}
          />
          {showSave && onSaveWidget && (
            <Button
              size="small"
              onClick={() =>
                onSaveWidget({
                  tailEnabled,
                  levels,
                  query
                })
              }
            >
              Save widget
            </Button>
          )}
          <Button size="small" onClick={clearLogs}>
            Clear
          </Button>
        </div>
      </div>
      <div className="log-viewer__body">
        {filteredLogs.length === 0 ? (
          <p className="log-viewer__empty">No logs yet.</p>
        ) : (
          <ul>
            {filteredLogs.map((entry) => (
              <li key={entry.id} className={`log-line log-line--${entry.level}`}>
                <span className="log-line__time">
                  {new Date(entry.ts).toLocaleString()}
                </span>
                <span className="log-line__level">{entry.level}</span>
                <span className="log-line__message">{entry.message}</span>
              </li>
            ))}
          </ul>
        )}
        <div ref={tailRef} />
      </div>
    </div>
  )
}
