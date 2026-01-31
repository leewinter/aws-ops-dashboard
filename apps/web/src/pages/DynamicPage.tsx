import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useCustomPages } from '../hooks/useCustomPages'
import { useWidgets } from '../hooks/useWidgets'
import CloudWatchViewer from '../components/logs/CloudWatchViewer'
import LogViewer from '../components/logs/LogViewer'
import SqsViewer from '../components/logs/SqsViewer'
import WidgetCard from '../components/widgets/WidgetCard'

export default function DynamicPage() {
  const { pageId } = useParams()
  const { pages } = useCustomPages()
  const { widgets, removeWidget } = useWidgets()

  const page = useMemo(() => pages.find((item) => item.id === pageId), [pages, pageId])
  const pageWidgets = useMemo(
    () => widgets.filter((widget) => widget.pageId === pageId),
    [widgets, pageId]
  )

  if (!page) {
    return (
      <div className="app-content-placeholder">
        <h2>Page not found</h2>
        <p>This page has been removed or renamed.</p>
      </div>
    )
  }

  return (
    <div className="widget-grid">
      {pageWidgets.length === 0 && (
        <div className="widget-card">
          <div className="app-content-placeholder">
            <h2>{page.name}</h2>
            <p>Save widgets in Settings to pin them here.</p>
          </div>
        </div>
      )}
      {pageWidgets.map((widget) => (
        <WidgetCard key={widget.id} widget={widget} onRemove={removeWidget}>
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
        </WidgetCard>
      ))}
    </div>
  )
}
