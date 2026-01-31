import { Button, Input, Select, Switch } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSqsMessages } from '../../hooks/useSqsMessages'

type Props = {
  initialQueueUrl?: string
  initialMaxNumber?: number
  initialAutoPoll?: boolean
  onSaveWidget?: (config: {
    queueUrl: string
    maxNumber: number
    autoPoll: boolean
  }) => void
}

export default function SqsViewer({
  initialQueueUrl,
  initialMaxNumber = 5,
  initialAutoPoll = false,
  onSaveWidget
}: Props) {
  const {
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
  } = useSqsMessages()
  const [queueUrl, setQueueUrl] = useState(
    initialQueueUrl ?? defaultQueueUrl ?? ''
  )
  const [maxNumber, setMaxNumber] = useState(initialMaxNumber)
  const [autoPoll, setAutoPoll] = useState(initialAutoPoll)
  const intervalRef = useRef<number | null>(null)

  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>()
    return messages.filter((message) => {
      const key = message.MessageId ?? `${message.Body ?? ''}-${message.Attributes?.SentTimestamp ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [messages])

  useEffect(() => {
    if (enabled) {
      loadQueues()
    }
  }, [enabled, loadQueues])

  useEffect(() => {
    if (defaultQueueUrl && !queueUrl) {
      setQueueUrl(defaultQueueUrl)
    }
  }, [defaultQueueUrl, queueUrl])

  useEffect(() => {
    if (!autoPoll || !queueUrl) return
    loadMessages({ queueUrl, maxNumber, append: true })
    intervalRef.current = window.setInterval(() => {
      loadMessages({ queueUrl, maxNumber, append: true })
    }, 5000)
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoPoll, loadMessages, maxNumber, queueUrl])

  if (!enabled) {
    return (
      <div className="log-viewer log-viewer--disabled">
        <h3>SQS messages</h3>
        <p>SQS viewer is disabled. Set ENABLE_SQS_VIEWER=true.</p>
      </div>
    )
  }

  return (
    <div className="log-viewer sqs-viewer">
      <div className="log-viewer__header">
        <div>
          <h3>SQS messages</h3>
          <span className="log-viewer__status">Region: {region ?? 'unknown'}</span>
        </div>
        <div className="log-viewer__actions">
          {onSaveWidget && (
            <Button
              size="small"
              onClick={() =>
                onSaveWidget({
                  queueUrl,
                  maxNumber,
                  autoPoll
                })
              }
              disabled={!queueUrl}
            >
              Add widget
            </Button>
          )}
          <Button
            size="small"
            onClick={() => loadMessages({ queueUrl, maxNumber, append: true })}
            disabled={!queueUrl || isLoading}
          >
            Fetch
          </Button>
        </div>
      </div>

      <div className="cloudwatch-controls">
        <Select
          placeholder="Select queue"
          value={queueUrl || undefined}
          onChange={(value) => setQueueUrl(value)}
          loading={isListing}
          options={queues.map((url) => ({ value: url, label: url }))}
          showSearch
          optionFilterProp="label"
          allowClear
        />
        <Input
          placeholder="Or enter queue URL"
          value={queueUrl}
          onChange={(event) => setQueueUrl(event.target.value)}
        />
        <Input
          type="number"
          min={1}
          max={10}
          placeholder="Max messages"
          value={maxNumber}
          onChange={(event) => setMaxNumber(Number(event.target.value))}
        />
        <label className="cloudwatch-toggle">
          <Switch checked={autoPoll} onChange={(checked) => setAutoPoll(checked)} />
          <span>Auto-poll</span>
        </label>
      </div>

      {listError && <p className="log-viewer__empty">{listError}</p>}
      {error && <p className="log-viewer__empty">{error}</p>}

      <div className="log-viewer__body">
        {uniqueMessages.length === 0 ? (
          <p className="log-viewer__empty">No messages.</p>
        ) : (
          <ul>
            {uniqueMessages.map((message, index) => (
              <li key={message.MessageId ?? index} className="log-line log-line--info">
                <span className="log-line__time">
                  {message.Attributes?.SentTimestamp
                    ? new Date(Number(message.Attributes.SentTimestamp)).toLocaleString()
                    : '--:--'}
                </span>
                <span className="log-line__level">{message.MessageId?.slice(0, 8) ?? 'msg'}</span>
                <span className="log-line__message">{message.Body}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
