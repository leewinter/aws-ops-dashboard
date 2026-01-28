import AuthForm from './components/AuthForm'
import SignedInPanel from './components/SignedInPanel'
import VerifyPanel from './components/VerifyPanel'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const {
    email,
    isLoading,
    isMagic,
    status,
    user,
    setEmail,
    requestLink,
    logout
  } = useAuth()

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
          <VerifyPanel isLoading={isLoading} status={status} />
        ) : user ? (
          <SignedInPanel
            email={user.email}
            isLoading={isLoading}
            onSignOut={logout}
          />
        ) : (
          <AuthForm
            email={email}
            isLoading={isLoading}
            status={status}
            onEmailChange={setEmail}
            onSubmit={requestLink}
          />
        )}
      </header>
    </div>
  )
}
