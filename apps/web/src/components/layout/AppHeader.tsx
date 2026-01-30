import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Button, Dropdown } from 'antd'
import type { ThemeKey } from '../../hooks/useTheme'

type Props = {
  collapsed: boolean
  onToggle: () => void
  userEmail: string
  isLoading: boolean
  onSignOut: () => void
  background: string
  themeKey: ThemeKey
  onThemeChange: (key: ThemeKey) => void
}

export default function AppHeader({
  collapsed,
  onToggle,
  userEmail,
  isLoading,
  onSignOut,
  background,
  themeKey,
  onThemeChange
}: Props) {
  const items: MenuProps['items'] = [
    {
      key: 'email',
      label: userEmail,
      disabled: true
    },
    { type: 'divider' },
    {
      key: 'theme-default',
      label: 'Theme: Default'
    },
    {
      key: 'theme-sunrise',
      label: 'Theme: Sunrise'
    },
    {
      key: 'theme-midnight',
      label: 'Theme: Midnight'
    },
    {
      key: 'theme-forest',
      label: 'Theme: Forest'
    },
    {
      key: 'theme-slate',
      label: 'Theme: Slate'
    },
    {
      key: 'theme-rose',
      label: 'Theme: Rose'
    },
    {
      key: 'theme-ocean',
      label: 'Theme: Ocean'
    },
    {
      key: 'theme-citrus',
      label: 'Theme: Citrus'
    },
    {
      key: 'theme-graphite',
      label: 'Theme: Graphite'
    },
    { type: 'divider' },
    {
      key: 'sign-out',
      label: 'Sign out',
      danger: true,
      disabled: isLoading
    }
  ]

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'sign-out') {
      onSignOut()
      return
    }
    if (key.startsWith('theme-')) {
      const selected = key.replace('theme-', '') as ThemeKey
      onThemeChange(selected)
    }
  }

  return (
    <div className="app-header" style={{ background }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
      <div className="app-header-meta">
        <Dropdown
          menu={{
            items: items.map((item) => {
              if (!item || item.type || typeof item.key !== 'string') return item
              if (item.key === `theme-${themeKey}`) {
                return { ...item, extra: 'Selected' }
              }
              return item
            }),
            onClick: onMenuClick,
            selectable: false
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<UserOutlined />}
            aria-label="Profile menu"
          >
            {userEmail}
          </Button>
        </Dropdown>
      </div>
    </div>
  )
}
