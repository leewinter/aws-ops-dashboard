import { Button } from 'antd'
import { useLogStream } from '../../hooks/useLogStream'

export default function LogViewer() {
  const { enabled, logs, status, clearLogs } = useLogStream()

  if (!enabled) {
    return (
      <div className="log-viewer log-viewer--disabled">
        <h3>Log viewer</h3>
        <p>Log viewer is disabled. Set ENABLE_LOG_VIEWER=true to enable it.</p>
      </div>
    )
  }

  return (
    <div className="log-viewer">
      <div className="log-viewer__header">
        <div>
          <h3>Log viewer</h3>
          <span className={`log-viewer__status log-viewer__status--${status}`}>
            {status}
          </span>
        </div>
        <Button size="small" onClick={clearLogs}>
          Clear
        </Button>
      </div>
      <div className="log-viewer__body">
        {logs.length === 0 ? (
          <p className="log-viewer__empty">No logs yet.</p>
        ) : (
          <ul>
            {logs.map((entry) => (
              <li key={entry.id} className={`log-line log-line--${entry.level}`}>
                <span className="log-line__time">
                  {new Date(entry.ts).toLocaleTimeString()}
                </span>
                <span className="log-line__level">{entry.level}</span>
                <span className="log-line__message">{entry.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
