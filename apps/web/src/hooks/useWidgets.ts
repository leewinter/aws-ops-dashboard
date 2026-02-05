import { useCallback, useEffect, useMemo, useState } from 'react'

export type CloudWatchWidgetConfig = {
  logGroup: string
  logStreams: string
  filterPattern: string
  range: '15m' | '1h' | '24h' | '7d' | '30d'
  showStream: boolean
}

export type LogViewerWidgetConfig = {
  tailEnabled: boolean
  levels: string[]
  query: string
}

export type WidgetType = 'log' | 'cloudwatch' | 'sqs' | 'users'

export type WidgetConfigMap = {
  log: LogViewerWidgetConfig
  cloudwatch: CloudWatchWidgetConfig
  sqs: {
    queueUrl: string
    maxNumber: number
    autoPoll: boolean
  }
  users: {
    showActiveOnly: boolean
  }
}

export type WidgetBase<T extends WidgetType = WidgetType> = {
  id: string
  type: T
  title: string
  createdAt: number
  pageId: string
  config: WidgetConfigMap[T]
}

export type Widget = {
  [K in WidgetType]: WidgetBase<K>
}[WidgetType]

const STORAGE_KEY = 'hono-widgets'

function loadWidgets(): Widget[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Widget[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => {
      const pageId = (item as { pageId?: string }).pageId ?? 'overview'
      if ((item as Widget).type === 'cloudwatch') {
        const cloud = item as Widget & { config: CloudWatchWidgetConfig }
        return {
          ...cloud,
          pageId,
          config: {
            ...cloud.config,
            showStream: cloud.config.showStream ?? true
          }
        }
      }
      return { ...item, pageId }
    })
  } catch {
    return []
  }
}

function saveWidgets(widgets: Widget[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
}

type UseWidgetsResult = {
  widgets: Widget[]
  addWidget: (widget: Omit<Widget, 'id' | 'createdAt'>) => void
  updateWidget: (id: string, updater: (current: Widget) => Widget) => void
  updateWidgetConfig: <T extends WidgetType>(
    id: string,
    type: T,
    config: WidgetConfigMap[T]
  ) => void
  removeWidget: (id: string) => void
}

export function useWidgets(): UseWidgetsResult {
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

  const updateWidget = useCallback(
    (id: string, updater: (current: Widget) => Widget) => {
      setWidgets((prev) => {
        const updated = prev.map((widget) => (widget.id === id ? updater(widget) : widget))
        saveWidgets(updated)
        return updated
      })
    },
    []
  )

  const updateWidgetConfig = useCallback(
    <T extends WidgetType>(id: string, type: T, config: WidgetConfigMap[T]) => {
      setWidgets((prev) => {
        const updated = prev.map((widget) => {
          if (widget.id !== id || widget.type !== type) return widget
          return {
            ...widget,
            config
          } as Widget
        })
        saveWidgets(updated)
        return updated
      })
    },
    []
  )

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
      updateWidget,
      updateWidgetConfig,
      removeWidget
    }),
    [widgets, addWidget, updateWidget, updateWidgetConfig, removeWidget]
  )

  return value
}
