import { useEffect, useMemo, useState } from 'react'
import type { ThemeConfig } from 'antd'

export type ThemeKey =
  | 'default'
  | 'sunrise'
  | 'midnight'
  | 'forest'
  | 'slate'
  | 'rose'
  | 'ocean'
  | 'citrus'
  | 'graphite'

const STORAGE_KEY = 'hono-theme'

const themeMap: Record<ThemeKey, ThemeConfig> = {
  default: {
    token: {
      colorPrimary: '#101018',
      colorBgElevated: '#ffffff',
      borderRadius: 12
    }
  },
  sunrise: {
    token: {
      colorPrimary: '#ff6b6b',
      colorBgLayout: '#fff7ed',
      colorBgContainer: '#fff1f2',
      colorBgElevated: '#ffffff',
      colorText: '#1f2937',
      borderRadius: 16
    }
  },
  midnight: {
    token: {
      colorPrimary: '#22d3ee',
      colorBgLayout: '#0b1020',
      colorBgContainer: '#121a2f',
      colorBgElevated: '#1f2a44',
      colorText: '#e2e8f0',
      borderRadius: 10
    }
  },
  forest: {
    token: {
      colorPrimary: '#0f766e',
      colorBgLayout: '#ecfdf3',
      colorBgContainer: '#f0fdf4',
      colorBgElevated: '#ffffff',
      colorText: '#0f172a',
      borderRadius: 14
    }
  },
  slate: {
    token: {
      colorPrimary: '#475569',
      colorBgLayout: '#f1f5f9',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorText: '#1f2937',
      borderRadius: 8
    }
  },
  rose: {
    token: {
      colorPrimary: '#db2777',
      colorBgLayout: '#fff1f2',
      colorBgContainer: '#ffe4e6',
      colorBgElevated: '#ffffff',
      colorText: '#1f2937',
      borderRadius: 18
    }
  },
  ocean: {
    token: {
      colorPrimary: '#2563eb',
      colorBgLayout: '#e0f2fe',
      colorBgContainer: '#e2e8f0',
      colorBgElevated: '#ffffff',
      colorText: '#0f172a',
      borderRadius: 12
    }
  },
  citrus: {
    token: {
      colorPrimary: '#f59e0b',
      colorBgLayout: '#fff7ed',
      colorBgContainer: '#ffedd5',
      colorBgElevated: '#ffffff',
      colorText: '#1f2937',
      borderRadius: 16
    }
  },
  graphite: {
    token: {
      colorPrimary: '#334155',
      colorBgLayout: '#111827',
      colorBgContainer: '#1f2937',
      colorBgElevated: '#2b3648',
      colorText: '#e5e7eb',
      borderRadius: 10
    }
  }
}

export function useTheme() {
  const [themeKey, setThemeKey] = useState<ThemeKey>('default')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeKey | null
    if (saved && themeMap[saved]) {
      setThemeKey(saved)
    }
  }, [])

  const setTheme = (key: ThemeKey) => {
    setThemeKey(key)
    window.localStorage.setItem(STORAGE_KEY, key)
  }

  const themeConfig = useMemo(() => themeMap[themeKey], [themeKey])

  return {
    themeKey,
    themeConfig,
    setTheme,
    themes: themeMap
  }
}
