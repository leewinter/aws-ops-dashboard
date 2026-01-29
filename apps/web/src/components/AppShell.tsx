import type { ReactNode } from 'react'
import { Layout, theme } from 'antd'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'
import { useLayout } from '../hooks/useLayout'

const { Header, Sider, Content } = Layout

type Props = {
  userEmail: string
  isLoading: boolean
  onSignOut: () => void
  children: ReactNode
}

export default function AppShell({
  userEmail,
  isLoading,
  onSignOut,
  children
}: Props) {
  const { collapsed, toggleCollapsed } = useLayout()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  return (
    <Layout className="app-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <AppSidebar />
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
