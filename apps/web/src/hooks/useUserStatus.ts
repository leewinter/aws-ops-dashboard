import { useCallback, useEffect, useState } from 'react'

export type UserStatus = {
  email: string
  activeSession: boolean
  lastLogin: number | null
  source?: 'env' | 'temp' | 'session'
  addedAt?: number | null
}

export function useUserStatus() {
  const [users, setUsers] = useState<UserStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setIsLoading(true)
    setError(null)
    return fetch('/api/users/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.ok) {
          setError('Failed to load users.')
          return
        }
        setUsers(data.users ?? [])
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { users, isLoading, error, refresh }
}
