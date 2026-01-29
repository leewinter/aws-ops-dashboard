import { useCallback, useState } from 'react'

export function useLayout() {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => !value)
  }, [])

  return {
    collapsed,
    toggleCollapsed
  }
}
