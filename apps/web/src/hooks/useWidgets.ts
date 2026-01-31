import { useCallback, useEffect, useMemo, useState } from 'react'

export type CloudWatchWidgetConfig = {
  logGroup: string
  logStreams: string
  filterPattern: string
  range: '15m' | '1h' | '24h' | '7d' | '30d'
}

export type LogViewerWidgetConfig = {
  tailEnabled: boolean
  levels: string[]
  query: string
}

export type WidgetBase = {
  id: string
  type: 'log' | 'cloudwatch' | 'sqs'
  title: string
  createdAt: number
  pageId: string
}

export type Widget =
  | (WidgetBase & {
      type: 'log'
      config: LogViewerWidgetConfig
    })
  | (WidgetBase & {
      type: 'cloudwatch'
      config: CloudWatchWidgetConfig
    })
  | (WidgetBase & {
      type: 'sqs'
      config: {
        queueUrl: string
        maxNumber: number
        autoPoll: boolean
      }
    })

const STORAGE_KEY = 'hono-widgets'

function loadWidgets(): Widget[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Widget[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => ({
      ...item,
      pageId: (item as { pageId?: string }).pageId ?? 'overview'
    }))
  } catch {
    return []
  }
}

function saveWidgets(widgets: Widget[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
}

export function useWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([])

  useEffect(() => {
    setWidgets(loadWidgets())
  }, [])

  const addWidget = useCallback((widget: Omit<Widget, 'id' | 'createdAt'>) => {
      const next: Widget = {
        ...(widget as Widget),
        id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now()
      }
      setWidgets((prev) => {
        const updated = [next, ...prev]
        saveWidgets(updated)
        return updated
      })
    }, [])

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== id)
      saveWidgets(updated)
      return updated
    })
  }, [])

  const value = useMemo(
    () => ({
      widgets,
      addWidget,
      removeWidget
    }),
    [widgets, addWidget, removeWidget]
  )

  return value
}
