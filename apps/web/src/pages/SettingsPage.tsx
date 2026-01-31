import { Button, Input, Modal, Select } from 'antd'
import LogViewer from '../components/logs/LogViewer'
import CloudWatchViewer from '../components/logs/CloudWatchViewer'
import { useCustomPages } from '../hooks/useCustomPages'
import { useWidgets } from '../hooks/useWidgets'
import { menuIconOptions } from '../lib/menuIcons'
import { useMemo, useState } from 'react'

export default function SettingsPage() {
  const { addWidget } = useWidgets()
  const { widgets } = useWidgets()
  const { pages, addPage, removePage, order, movePage } = useCustomPages()
  const [pageName, setPageName] = useState('')
  const [pageIcon, setPageIcon] = useState(menuIconOptions[0]?.key ?? 'app')
  const [targetPage, setTargetPage] = useState('overview')
  const [isDestinationOpen, setIsDestinationOpen] = useState(false)
  const [pendingSave, setPendingSave] = useState<
    | { type: 'log'; config: { tailEnabled: boolean; levels: string[]; query: string } }
    | {
        type: 'cloudwatch'
        config: {
          logGroup: string
          logStreams: string
          filterPattern: string
          range: '15m' | '1h' | '24h' | '7d' | '30d'
        }
      }
    | null
  >(null)

  const pageOptions = useMemo(
    () =>
      menuIconOptions.map((option) => ({
        value: option.key,
        label: (
          <span className="icon-option">
            {option.icon}
            <span>{option.label}</span>
          </span>
        )
      })),
    []
  )

  const targetPageOptions = useMemo(
    () => [
      { value: 'overview', label: 'Overview' },
      ...pages.map((page) => ({ value: page.id, label: page.name }))
    ],
    [pages]
  )

  return (
    <div className="settings-page">
      <div className="settings-summary">
        <h2>Settings</h2>
        <p>Manage SMTP, session, and security preferences.</p>
      </div>
      <div className="settings-card">
        <div className="settings-card__header">
          <h3>Custom pages</h3>
          <p>Add pages to the sidebar with an icon.</p>
        </div>
        <div className="settings-card__controls">
          <Input
            placeholder="Page name"
            value={pageName}
            onChange={(event) => setPageName(event.target.value)}
          />
          <Select
            value={pageIcon}
            onChange={(value) => setPageIcon(value)}
            options={pageOptions}
          />
          <Button
            type="primary"
            onClick={() => {
              if (!pageName.trim()) return
              addPage({ name: pageName, icon: pageIcon })
              setPageName('')
            }}
          >
            Add page
          </Button>
        </div>
        {order.length > 0 && (
          <div className="settings-card__list">
            {order.map((id) => {
              const page =
                id === 'overview'
                  ? { id, name: 'Overview' }
                  : id === 'settings'
                    ? { id, name: 'Settings' }
                    : pages.find((item) => item.id === id)
              if (!page) return null
              const widgetCount = widgets.filter((widget) => widget.pageId === page.id).length

              return (
                <div key={page.id} className="settings-card__item">
                  <span className="settings-card__item-name">{page.name}</span>
                  <div className="settings-card__item-actions">
                    <Button size="small" onClick={() => movePage(page.id, 'up')}>
                      Up
                    </Button>
                    <Button size="small" onClick={() => movePage(page.id, 'down')}>
                      Down
                    </Button>
                    {page.id !== 'overview' && page.id !== 'settings' && (
                      <Button
                        size="small"
                        danger={widgetCount > 0}
                        onClick={() => {
                          if (widgetCount === 0) {
                            removePage(page.id)
                            return
                          }
                          Modal.confirm({
                            title: 'Remove this page?',
                            content: `This page has ${widgetCount} widget${
                              widgetCount === 1 ? '' : 's'
                            } assigned. Removing it will hide those widgets.`,
                            okText: 'Remove',
                            okType: 'danger',
                            onOk: () => removePage(page.id)
                          })
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <LogViewer
        showSave
        onSaveWidget={(config) =>
          (() => {
            setPendingSave({ type: 'log', config })
            setIsDestinationOpen(true)
          })()
        }
      />
      <CloudWatchViewer
        showSave
        onSaveWidget={(config) =>
          (() => {
            setPendingSave({ type: 'cloudwatch', config })
            setIsDestinationOpen(true)
          })()
        }
      />
      <Modal
        title="Choose widget destination"
        open={isDestinationOpen}
        onCancel={() => {
          setIsDestinationOpen(false)
          setPendingSave(null)
        }}
        onOk={() => {
          if (!pendingSave) return
          if (pendingSave.type === 'log') {
            addWidget({
              type: 'log',
              title: 'Log viewer',
              pageId: targetPage,
              config: pendingSave.config
            })
          } else {
            addWidget({
              type: 'cloudwatch',
              title: `CloudWatch: ${pendingSave.config.logGroup || 'logs'}`,
              pageId: targetPage,
              config: pendingSave.config
            })
          }
          setIsDestinationOpen(false)
          setPendingSave(null)
        }}
        okText="Save widget"
      >
        <p>Select which page this widget should appear on.</p>
        <Select
          value={targetPage}
          onChange={(value) => setTargetPage(value)}
          options={targetPageOptions}
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  )
}
