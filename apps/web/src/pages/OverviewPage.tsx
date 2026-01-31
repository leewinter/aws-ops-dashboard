import { Button } from 'antd'
import LogViewer from '../components/logs/LogViewer'
import CloudWatchViewer from '../components/logs/CloudWatchViewer'
import SqsViewer from '../components/logs/SqsViewer'
import { useWidgets } from '../hooks/useWidgets'

export default function OverviewPage() {
  const { widgets, removeWidget } = useWidgets()
  const pageWidgets = widgets.filter((widget) => widget.pageId === 'overview')

  return (
    <div className="widget-grid">
      {pageWidgets.length === 0 && (
        <div className="widget-card">
          <div className="app-content-placeholder">
            <h2>Welcome back</h2>
            <p>Save widgets in Settings to pin them here.</p>
          </div>
        </div>
      )}
      {pageWidgets.map((widget) => (
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
          ) : widget.type === 'cloudwatch' ? (
            <CloudWatchViewer
              initialLogGroup={widget.config.logGroup}
              initialLogStreams={widget.config.logStreams}
              initialFilterPattern={widget.config.filterPattern}
              initialRange={widget.config.range}
              autoFetch
            />
          ) : (
            <SqsViewer
              initialQueueUrl={widget.config.queueUrl}
              initialMaxNumber={widget.config.maxNumber}
              initialAutoPoll={widget.config.autoPoll}
            />
          )}
        </div>
      ))}
    </div>
  )
}
