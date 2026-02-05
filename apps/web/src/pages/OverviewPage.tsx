import LogViewer from '../components/logs/LogViewer'
import CloudWatchViewer from '../components/logs/CloudWatchViewer'
import SqsViewer from '../components/logs/SqsViewer'
import { useWidgets } from '../hooks/useWidgets'
import WidgetCard from '../components/widgets/WidgetCard'
import UsersWidget from '../components/widgets/UsersWidget'

export default function OverviewPage() {
  const { widgets, removeWidget, updateWidgetConfig } = useWidgets()
  const pageWidgets = widgets.filter((widget) => widget.pageId === 'overview')

  const renderWidget = (widget: typeof pageWidgets[number]) => {
    switch (widget.type) {
      case 'log':
        return (
            <LogViewer
              initialTailEnabled={widget.config.tailEnabled}
              initialLevels={widget.config.levels}
              initialQuery={widget.config.query}
              showSave
              saveLabel="Save changes"
              onSaveWidget={(config) => updateWidgetConfig(widget.id, 'log', config)}
            />
        )
      case 'cloudwatch':
        return (
            <CloudWatchViewer
              initialLogGroup={widget.config.logGroup}
              initialLogStreams={widget.config.logStreams}
              initialFilterPattern={widget.config.filterPattern}
              initialRange={widget.config.range}
              initialShowStream={widget.config.showStream}
              autoFetch
              showSave
              saveLabel="Save changes"
              onSaveWidget={(config) =>
                updateWidgetConfig(widget.id, 'cloudwatch', config)
              }
            />
        )
      case 'sqs':
        return (
            <SqsViewer
              initialQueueUrl={widget.config.queueUrl}
              initialMaxNumber={widget.config.maxNumber}
              initialAutoPoll={widget.config.autoPoll}
              saveLabel="Save changes"
              onSaveWidget={(config) => updateWidgetConfig(widget.id, 'sqs', config)}
            />
        )
      case 'users':
        return (
            <UsersWidget
              initialShowActiveOnly={widget.config.showActiveOnly}
              showSave
              saveLabel="Save changes"
              onSaveWidget={(config) =>
                updateWidgetConfig(widget.id, 'users', config)
              }
            />
        )
      default:
        return null
    }
  }

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
        <WidgetCard key={widget.id} widget={widget} onRemove={removeWidget}>
          {renderWidget(widget)}
        </WidgetCard>
      ))}
    </div>
  )
}
