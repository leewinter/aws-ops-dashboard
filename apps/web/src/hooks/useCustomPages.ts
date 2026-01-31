import { useCustomPagesContext } from '../context/CustomPagesContext'

export type CustomPage = {
  id: string
  name: string
  icon: string
  createdAt: number
}

export function useCustomPages() {
  return useCustomPagesContext()
}
