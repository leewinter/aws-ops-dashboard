import LogViewer from '../components/logs/LogViewer'

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-summary">
        <h2>Settings</h2>
        <p>Manage SMTP, session, and security preferences.</p>
      </div>
      <LogViewer />
    </div>
  )
}
