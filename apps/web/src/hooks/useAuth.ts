import { useCallback, useEffect, useRef, useState } from 'react'

type User = { email: string } | null

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  return res.json() as Promise<T>
}

export function useAuth() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(false)
  const verifyStarted = useRef(false)

  const [isMagic, setIsMagic] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const tokenValue = url.searchParams.get('token')
    setToken(tokenValue)
    setIsMagic(url.pathname === '/magic' && Boolean(tokenValue))
  }, [])

  useEffect(() => {
    fetchJson<{ user: User }>('/api/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (!isMagic || !token || verifyStarted.current) return
    verifyStarted.current = true
    setIsLoading(true)
    fetchJson<{ ok: boolean; user?: User }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
      .then((data) => {
        if (data.ok && data.user) {
          setUser(data.user)
          setStatus('Signed in. You can close this tab.')
          window.history.replaceState({}, '', '/')
          setIsMagic(false)
        } else {
          setStatus('That link is invalid or expired.')
        }
      })
      .catch(() => setStatus('Could not verify the link.'))
      .finally(() => setIsLoading(false))
  }, [isMagic, token])

  const requestLink = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setIsLoading(true)
      setStatus(null)
      await fetchJson('/api/auth/request', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
        .then(() => {
          setStatus('Check your email for the magic link.')
          setEmail('')
        })
        .catch(() => setStatus('Could not send the link. Try again.'))
        .finally(() => setIsLoading(false))
    },
    [email]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    await fetchJson('/api/auth/logout', { method: 'POST' })
      .then(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  return {
    email,
    isLoading,
    isMagic,
    status,
    user,
    setEmail,
    requestLink,
    logout
  }
}
