import { Button } from 'antd'
import LogViewer from '../components/logs/LogViewer'
import CloudWatchViewer from '../components/logs/CloudWatchViewer'
import { useWidgets } from '../hooks/useWidgets'

export default function OverviewPage() {
  const { widgets, removeWidget } = useWidgets()

  if (widgets.length === 0) {
    return (
      <div className="app-content-placeholder">
        <h2>Welcome back</h2>
        <p>Save widgets in Settings to pin them here.</p>
      </div>
    )
  }

  return (
    <div className="widget-grid">
      {widgets.map((widget) => (
        <div key={widget.id} className="widget-card">
          <div className="widget-card__header">
            <h3>{widget.title}</h3>
            <Button size="small" onClick={() => removeWidget(widget.id)}>
              Remove
            </Button>
          </div>
          {widget.type === 'log' ? (
            <LogViewer
              initialTailEnabled={widget.config.tailEnabled}
              initialLevels={widget.config.levels}
              initialQuery={widget.config.query}
            />
          ) : (
            <CloudWatchViewer
              initialLogGroup={widget.config.logGroup}
              initialLogStreams={widget.config.logStreams}
              initialFilterPattern={widget.config.filterPattern}
              initialRange={widget.config.range}
              autoFetch
            />
          )}
        </div>
      ))}
    </div>
  )
}
