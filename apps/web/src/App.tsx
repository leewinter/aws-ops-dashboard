import AppContentPlaceholder from './components/AppContentPlaceholder'
import AppShell from './components/AppShell'
import AuthForm from './components/AuthForm'
import AuthHero from './components/AuthHero'
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

  if (user && !isMagic) {
    return (
      <div className="page page-full">
        <AppShell
          userEmail={user.email}
          isLoading={isLoading}
          onSignOut={logout}
        >
          <AppContentPlaceholder />
        </AppShell>
      </div>
    )
  }

  return (
    <div className="page">
      <AuthHero>
        {isMagic ? (
          <VerifyPanel isLoading={isLoading} status={status} />
        ) : (
          <AuthForm
            email={email}
            isLoading={isLoading}
            status={status}
            onEmailChange={setEmail}
            onSubmit={requestLink}
          />
        )}
      </AuthHero>
    </div>
  )
}