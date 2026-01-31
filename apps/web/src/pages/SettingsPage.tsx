import LogViewer from '../components/logs/LogViewer'
import CloudWatchViewer from '../components/logs/CloudWatchViewer'
import { useWidgets } from '../hooks/useWidgets'

export default function SettingsPage() {
  const { addWidget } = useWidgets()

  return (
    <div className="settings-page">
      <div className="settings-summary">
        <h2>Settings</h2>
        <p>Manage SMTP, session, and security preferences.</p>
      </div>
      <LogViewer
        showSave
        onSaveWidget={(config) =>
          addWidget({
            type: 'log',
            title: 'Log viewer',
            config
          })
        }
      />
      <CloudWatchViewer
        showSave
        onSaveWidget={(config) =>
          addWidget({
            type: 'cloudwatch',
            title: `CloudWatch: ${config.logGroup || 'logs'}`,
            config
          })
        }
      />
    </div>
  )
}
