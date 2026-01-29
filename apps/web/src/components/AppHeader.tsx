import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type Props = {
  collapsed: boolean
  onToggle: () => void
  userEmail: string
  isLoading: boolean
  onSignOut: () => void
  background: string
}

export default function AppHeader({
  collapsed,
  onToggle,
  userEmail,
  isLoading,
  onSignOut,
  background
}: Props) {
  return (
    <div className="app-header" style={{ background }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
      <div className="app-header-meta">
        <span>{userEmail}</span>
        <Button onClick={onSignOut} disabled={isLoading}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
