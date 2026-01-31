import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CustomPage } from '../hooks/useCustomPages'

type CustomPagesContextValue = {
  pages: CustomPage[]
  addPage: (input: { name: string; icon: string }) => void
  removePage: (id: string) => void
  order: string[]
  movePage: (id: string, direction: 'up' | 'down') => void
}

const CustomPagesContext = createContext<CustomPagesContextValue | null>(null)

const STORAGE_KEY = 'hono-custom-pages'
const ORDER_KEY = 'hono-menu-order'

function loadPages(): CustomPage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CustomPage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePages(pages: CustomPage[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pages))
}

function loadOrder(): string[] {
  try {
    const raw = window.localStorage.getItem(ORDER_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveOrder(order: string[]) {
  window.localStorage.setItem(ORDER_KEY, JSON.stringify(order))
}

export function CustomPagesProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<CustomPage[]>(() => loadPages())
  const [order, setOrder] = useState<string[]>(() => loadOrder())

  useEffect(() => {
    const ids = ['overview', 'settings', ...pages.map((page) => page.id)]
    setOrder((prev) => {
      const next = prev.filter((id) => ids.includes(id))
      for (const id of ids) {
        if (!next.includes(id)) next.push(id)
      }
      saveOrder(next)
      return next
    })
  }, [pages])

  const addPage = (input: { name: string; icon: string }) => {
    const next: CustomPage = {
      id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      icon: input.icon,
      createdAt: Date.now()
    }
    setPages((prev) => {
      const updated = [next, ...prev]
      savePages(updated)
      return updated
    })
    setOrder((prev) => {
      const updated = [...prev, next.id]
      saveOrder(updated)
      return updated
    })
  }

  const removePage = (id: string) => {
    setPages((prev) => {
      const updated = prev.filter((page) => page.id !== id)
      savePages(updated)
      return updated
    })
    setOrder((prev) => {
      const updated = prev.filter((item) => item !== id)
      saveOrder(updated)
      return updated
    })
  }

  const movePage = (id: string, direction: 'up' | 'down') => {
    setOrder((prev) => {
      const index = prev.indexOf(id)
      if (index === -1) return prev
      const next = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      saveOrder(next)
      return next
    })
  }

  const value = useMemo(
    () => ({
      pages,
      addPage,
      removePage,
      order,
      movePage
    }),
    [pages, order]
  )

  return (
    <CustomPagesContext.Provider value={value}>
      {children}
    </CustomPagesContext.Provider>
  )
}

export function useCustomPagesContext() {
  const ctx = useContext(CustomPagesContext)
  if (!ctx) {
    throw new Error('useCustomPagesContext must be used within CustomPagesProvider')
  }
  return ctx
}
