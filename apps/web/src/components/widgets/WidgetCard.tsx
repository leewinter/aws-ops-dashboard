import { Button } from 'antd'
import type { ReactNode } from 'react'
import type { WidgetBase } from '../../hooks/useWidgets'

type Props = {
  widget: WidgetBase
  onRemove: (id: string) => void
  children: ReactNode
}

export default function WidgetCard({ widget, onRemove, children }: Props) {
  return (
    <div className="widget-card">
      <div className="widget-card__header">
        <h3>{widget.title}</h3>
        <Button size="small" onClick={() => onRemove(widget.id)}>
          Remove
        </Button>
      </div>
      {children}
    </div>
  )
}
