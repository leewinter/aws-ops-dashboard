import { Button, Switch } from 'antd'
import { useMemo, useState } from 'react'
import { useUserStatus } from '../../hooks/useUserStatus'

type Props = {
  initialShowActiveOnly?: boolean
  showSave?: boolean
  saveLabel?: string
  requireDirty?: boolean
  onSaveWidget?: (config: { showActiveOnly: boolean }) => void
}

export default function UsersWidget({
  initialShowActiveOnly = false,
  showSave,
  saveLabel = 'Add widget',
  requireDirty = true,
  onSaveWidget
}: Props) {
  const { users, isLoading, error } = useUserStatus()
  const [showActiveOnly, setShowActiveOnly] = useState(initialShowActiveOnly)
  const [baseline, setBaseline] = useState({ showActiveOnly: initialShowActiveOnly })

  const isDirty = baseline.showActiveOnly !== showActiveOnly

  const filtered = useMemo(
    () =>
      showActiveOnly
        ? users.filter((user) => user.activeSession)
        : users,
    [showActiveOnly, users]
  )

  return (
    <div className="log-viewer users-widget">
      <div className="log-viewer__header">
        <div>
          <h3>Users</h3>
          <span className="log-viewer__status">Allowed and active sessions</span>
        </div>
        <div className="log-viewer__actions">
          {showSave && onSaveWidget && (
            <Button
              size="small"
              disabled={requireDirty ? !isDirty : false}
              onClick={() => {
                onSaveWidget({ showActiveOnly })
                setBaseline({ showActiveOnly })
              }}
            >
              {saveLabel}
            </Button>
          )}
          <label className="cloudwatch-toggle">
            <Switch checked={showActiveOnly} onChange={(checked) => setShowActiveOnly(checked)} />
            <span>Active only</span>
          </label>
        </div>
      </div>

      {error && <p className="log-viewer__empty">{error}</p>}

      <div className="log-viewer__body">
        {isLoading ? (
          <p className="log-viewer__empty">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="log-viewer__empty">No users found.</p>
        ) : (
          <ul>
            {filtered.map((user) => (
              <li key={user.email} className="log-line log-line--info">
                <span className="log-line__time">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </span>
                <span className="log-line__level">
                  {user.activeSession ? 'Active' : 'Idle'}
                </span>
                <span className="log-line__message">{user.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
