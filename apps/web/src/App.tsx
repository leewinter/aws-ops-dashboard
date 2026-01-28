import { useEffect, useMemo, useRef, useState } from 'react'

type User = { email: string } | null

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  return res.json() as Promise<T>
}

export default function App() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(false)
  const verifyStarted = useRef(false)

  const url = useMemo(() => new URL(window.location.href), [])
  const token = url.searchParams.get('token')
  const isMagic = url.pathname === '/magic' && Boolean(token)

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
        } else {
          setStatus('That link is invalid or expired.')
        }
      })
      .catch(() => setStatus('Could not verify the link.'))
      .finally(() => setIsLoading(false))
  }, [isMagic, token])

  const requestLink = async (event: React.FormEvent) => {
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
  }

  const logout = async () => {
    setIsLoading(true)
    await fetchJson('/api/auth/logout', { method: 'POST' })
      .then(() => setUser(null))
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Magic Link Auth</p>
        <h1>Email-only sign in for Hono + React.</h1>
        <p className="lede">
          Enter your email to receive a one-time link. In dev, check your server
          logs for the magic link unless SMTP is configured.
        </p>

        {isMagic ? (
          <div className="panel">
            <p>{isLoading ? 'Signing you in…' : status}</p>
          </div>
        ) : user ? (
          <div className="panel">
            <p>
              Signed in as <strong>{user.email}</strong>
            </p>
            <button className="button" onClick={logout} disabled={isLoading}>
              Sign out
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={requestLink}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <button className="button" type="submit" disabled={isLoading}>
              {isLoading ? 'Sending…' : 'Send magic link'}
            </button>
            {status && <p className="status-text">{status}</p>}
          </form>
        )}
      </header>
    </div>
  )
}
