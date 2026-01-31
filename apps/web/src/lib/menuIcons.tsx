import {
  AppstoreOutlined,
  ApiOutlined,
  BarChartOutlined,
  ClusterOutlined,
  CodeOutlined,
  CloudOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  GatewayOutlined,
  GlobalOutlined,
  HomeOutlined,
  InboxOutlined,
  MonitorOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  ShareAltOutlined,
  SignalFilled,
  SettingOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  HddOutlined,
  CloudServerOutlined
} from '@ant-design/icons'
import type { ReactNode } from 'react'

export const menuIconOptions = [
  { key: 'home', label: 'Home', icon: <HomeOutlined /> },
  { key: 'app', label: 'App', icon: <AppstoreOutlined /> },
  { key: 'api', label: 'API', icon: <ApiOutlined /> },
  { key: 'server', label: 'Server', icon: <CloudServerOutlined /> },
  { key: 'database', label: 'Database', icon: <DatabaseOutlined /> },
  { key: 'cloud', label: 'Cloud', icon: <CloudOutlined /> },
  { key: 'cluster', label: 'Cluster', icon: <ClusterOutlined /> },
  { key: 'deploy', label: 'Deploy', icon: <DeploymentUnitOutlined /> },
  { key: 'gateway', label: 'Gateway', icon: <GatewayOutlined /> },
  { key: 'monitor', label: 'Monitor', icon: <MonitorOutlined /> },
  { key: 'sync', label: 'Sync', icon: <SyncOutlined /> },
  { key: 'share', label: 'Share', icon: <ShareAltOutlined /> },
  { key: 'signal', label: 'Signal', icon: <SignalFilled /> },
  { key: 'global', label: 'Global', icon: <GlobalOutlined /> },
  { key: 'inbox', label: 'Inbox', icon: <InboxOutlined /> },
  { key: 'secure', label: 'Secure', icon: <SafetyCertificateOutlined /> },
  { key: 'shield', label: 'Shield', icon: <FileProtectOutlined /> },
  { key: 'code', label: 'Code', icon: <CodeOutlined /> },
  { key: 'storage', label: 'Storage', icon: <HddOutlined /> },
  { key: 'chart', label: 'Chart', icon: <BarChartOutlined /> },
  { key: 'pie', label: 'Pie', icon: <PieChartOutlined /> },
  { key: 'file', label: 'File', icon: <FileTextOutlined /> },
  { key: 'bolt', label: 'Bolt', icon: <ThunderboltOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> }
]

export function getMenuIcon(key: string): ReactNode {
  return menuIconOptions.find((option) => option.key === key)?.icon ?? <AppstoreOutlined />
}
