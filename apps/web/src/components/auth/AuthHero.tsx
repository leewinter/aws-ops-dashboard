import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function AuthHero({ children }: Props) {
  return (
    <header className="hero">
      <h1>Sign in</h1>
      <p className="lede">
        Enter your email to receive a one-time link. In dev, check your server
        logs for the magic link unless SMTP is configured.
      </p>
      {children}
    </header>
  )
}
