import { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(`ok at ${data.time}`))
      .catch(() => setStatus('api unreachable'))
  }, [])

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Hono + React</p>
        <h1>Single-port in Docker, split in dev.</h1>
        <p className="lede">
          The API runs on <strong>8787</strong> while Vite runs on{' '}
          <strong>5173</strong>. When you build the Docker image, the Hono server
          serves both the API and the built React app on the same port.
        </p>
        <div className="status">
          <span className="dot" aria-hidden="true" />
          <span>API status: {status}</span>
        </div>
      </header>
    </div>
  )
}