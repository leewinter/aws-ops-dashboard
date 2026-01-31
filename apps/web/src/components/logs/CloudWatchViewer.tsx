import { Button, Input, Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useCloudWatchLogs } from '../../hooks/useCloudWatchLogs'

type Props = {
  showSave?: boolean
  initialLogGroup?: string
  initialLogStreams?: string
  initialFilterPattern?: string
  initialRange?: '15m' | '1h' | '24h' | '7d' | '30d'
  autoFetch?: boolean
  onSaveWidget?: (config: {
    logGroup: string
    logStreams: string
    filterPattern: string
    range: '15m' | '1h' | '24h' | '7d' | '30d'
  }) => void
}

export default function CloudWatchViewer({
  showSave,
  initialLogGroup,
  initialLogStreams = '',
  initialFilterPattern = '',
  initialRange = '1h',
  autoFetch,
  onSaveWidget
}: Props) {
  const {
    enabled,
    region,
    defaultLogGroup,
    isLoading,
    error,
    events,
    loadLogs,
    nextToken,
    logGroups,
    loadLogGroups,
    isListing,
    listError
  } = useCloudWatchLogs()
  const [logGroup, setLogGroup] = useState(initialLogGroup ?? defaultLogGroup ?? '')
  const [logStreams, setLogStreams] = useState(initialLogStreams)
  const [filterPattern, setFilterPattern] = useState(initialFilterPattern)
  const [range, setRange] = useState<'15m' | '1h' | '24h' | '7d' | '30d'>(
    initialRange
  )

  const streamList = useMemo(
    () =>
      logStreams
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
    [logStreams]
  )

  const timeRange = useMemo(() => {
    const now = Date.now()
    if (range === '15m') return { startTime: now - 15 * 60 * 1000, endTime: now }
    if (range === '7d') return { startTime: now - 7 * 24 * 60 * 60 * 1000, endTime: now }
    if (range === '30d') return { startTime: now - 30 * 24 * 60 * 60 * 1000, endTime: now }
    if (range === '24h') return { startTime: now - 24 * 60 * 60 * 1000, endTime: now }
    return { startTime: now - 60 * 60 * 1000, endTime: now }
  }, [range])

  useEffect(() => {
    if (enabled) {
      loadLogGroups()
    }
  }, [enabled, loadLogGroups])

  useEffect(() => {
    if (defaultLogGroup && !logGroup) {
      setLogGroup(defaultLogGroup)
    }
  }, [defaultLogGroup, logGroup])

  useEffect(() => {
    if (!autoFetch) return
    if (!logGroup) return
    loadLogs({
      logGroupName: logGroup,
      logStreamNames: streamList.length ? streamList : undefined,
      filterPattern: filterPattern || undefined,
      ...timeRange
    })
  }, [autoFetch, filterPattern, loadLogs, logGroup, streamList, timeRange])

  if (!enabled) {
    return (
      <div className="log-viewer log-viewer--disabled">
        <h3>CloudWatch logs</h3>
        <p>CloudWatch log viewer is disabled. Set ENABLE_CLOUDWATCH_VIEWER=true.</p>
      </div>
    )
  }

  return (
    <div className="log-viewer cloudwatch-viewer">
      <div className="log-viewer__header">
        <div>
          <h3>CloudWatch logs</h3>
          <span className="log-viewer__status">Region: {region ?? 'unknown'}</span>
        </div>
        <div className="log-viewer__actions">
          {showSave && onSaveWidget && (
            <Button
              size="small"
              onClick={() =>
                onSaveWidget({
                  logGroup,
                  logStreams,
                  filterPattern,
                  range
                })
              }
              disabled={!logGroup}
            >
              Save widget
            </Button>
          )}
          <Button
            size="small"
            onClick={() =>
              loadLogs({
                logGroupName: logGroup,
                logStreamNames: streamList.length ? streamList : undefined,
                filterPattern: filterPattern || undefined,
                ...timeRange
              })
            }
            disabled={!logGroup || isLoading}
          >
            Fetch
          </Button>
        </div>
      </div>

      <div className="cloudwatch-controls">
        <Select
          placeholder="Select log group"
          value={logGroup || undefined}
          onChange={(value) => setLogGroup(value)}
          loading={isListing}
          options={logGroups.map((name) => ({ value: name, label: name }))}
          showSearch
          optionFilterProp="label"
          allowClear
        />
        <Input
          placeholder="Or enter log group name"
          value={logGroup}
          onChange={(event) => setLogGroup(event.target.value)}
        />
        <Input
          placeholder="Log stream names (comma-separated)"
          value={logStreams}
          onChange={(event) => setLogStreams(event.target.value)}
        />
        <Input
          placeholder="Filter pattern (optional)"
          value={filterPattern}
          onChange={(event) => setFilterPattern(event.target.value)}
        />
        <Select
          value={range}
          onChange={(value) => setRange(value)}
          options={[
            { value: '15m', label: 'Last 15 min' },
            { value: '1h', label: 'Last 1 hour' },
            { value: '24h', label: 'Last 24 hours' },
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' }
          ]}
        />
      </div>

      {listError && <p className="log-viewer__empty">{listError}</p>}
      {error && <p className="log-viewer__empty">{error}</p>}

      <div className="log-viewer__body">
        {events.length === 0 ? (
          <p className="log-viewer__empty">No events.</p>
        ) : (
          <ul>
            {events.map((entry, index) => (
              <li key={entry.eventId ?? index} className="log-line log-line--info">
                <span className="log-line__time">
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '--:--'}
                </span>
                <span className="log-line__level">
                  {entry.logStreamName ? entry.logStreamName.split('/').pop() : 'log'}
                </span>
                <span className="log-line__message">{entry.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {nextToken && (
        <div className="cloudwatch-footer">
          <Button
            size="small"
            onClick={() =>
              loadLogs({
                logGroupName: logGroup,
                logStreamNames: streamList.length ? streamList : undefined,
                filterPattern: filterPattern || undefined,
                ...timeRange,
                append: true
              })
            }
            disabled={isLoading}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
