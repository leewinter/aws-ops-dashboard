import type { MenuProps } from 'antd'
import { Menu } from 'antd'

type Props = {
  items: MenuProps['items']
  selectedKeys: string[]
  onSelect: MenuProps['onClick']
}

export default function AppSidebar({ items, selectedKeys, onSelect }: Props) {
  return (
    <>
      <div className="app-logo" />
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
