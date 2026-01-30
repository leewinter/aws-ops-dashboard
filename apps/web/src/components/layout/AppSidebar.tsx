import type { MenuProps } from 'antd'
import { Menu } from 'antd'

type Props = {
  items: MenuProps['items']
  selectedKeys: string[]
  onSelect: MenuProps['onClick']
  logoBackground?: string
}

export default function AppSidebar({
  items,
  selectedKeys,
  onSelect,
  logoBackground
}: Props) {
  return (
    <>
      <div
        className="app-logo"
        style={logoBackground ? { background: logoBackground } : undefined}
      >
        <img src="/wacoal_int_layer.png" alt="Integration Layer" />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={onSelect}
        items={items}
      />
    </>
  )
}
