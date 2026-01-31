import type { ReactNode } from 'react'
import { Layout, theme } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'
import { useLayout } from '../../hooks/useLayout'
import type { ThemeKey } from '../../hooks/useTheme'
import { useCustomPages } from '../../hooks/useCustomPages'
import { getMenuIcon } from '../../lib/menuIcons'

const { Header, Sider, Content } = Layout

type Props = {
  userEmail: string
  isLoading: boolean
  onSignOut: () => void
  themeKey: ThemeKey
  onThemeChange: (key: ThemeKey) => void
  children: ReactNode
}

export default function AppShell({
  userEmail,
  isLoading,
  onSignOut,
  themeKey,
  onThemeChange,
  children
}: Props) {
  const { collapsed, toggleCollapsed } = useLayout()
  const {
    token: { colorBgContainer, colorBgElevated, borderRadiusLG }
  } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const { pages, order } = useCustomPages()

  const menuItems = order
    .map((id) => {
      if (id === 'overview') {
        return {
          key: '/',
          icon: getMenuIcon('home'),
          label: 'Overview'
        }
      }
      if (id === 'settings') {
        return {
          key: '/settings',
          icon: getMenuIcon('settings'),
          label: 'Settings'
        }
      }
      const page = pages.find((item) => item.id === id)
      if (!page) return null
      return {
        key: `/page/${page.id}`,
        icon: getMenuIcon(page.icon),
        label: page.name
      }
    })
    .filter(Boolean)

  return (
    <Layout className="app-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <AppSidebar
          items={menuItems}
          selectedKeys={[location.pathname]}
          onSelect={(event) => navigate(event.key)}
          logoBackground={colorBgElevated}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <AppHeader
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            userEmail={userEmail}
            isLoading={isLoading}
            onSignOut={onSignOut}
            background={colorBgContainer}
            themeKey={themeKey}
            onThemeChange={onThemeChange}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
