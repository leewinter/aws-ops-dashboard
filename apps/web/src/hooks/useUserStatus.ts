import { useEffect, useState } from 'react'

export type UserStatus = {
  email: string
  activeSession: boolean
  lastLogin: number | null
}

export function useUserStatus() {
  const [users, setUsers] = useState<UserStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetch('/api/users/status')
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

  return { users, isLoading, error }
}
