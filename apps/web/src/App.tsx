import AppShell from './components/AppShell'
import AuthForm from './components/AuthForm'
import AuthHero from './components/AuthHero'
import VerifyPanel from './components/VerifyPanel'
import { useAuth } from './hooks/useAuth'
import { Navigate, Route, Routes } from 'react-router-dom'
import OverviewPage from './pages/OverviewPage'
import MagicLinksPage from './pages/MagicLinksPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const {
    email,
    isLoading,
    isMagic,
    status,
    statusTone,
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
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/magic-links" element={<MagicLinksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
            statusTone={statusTone}
            onEmailChange={setEmail}
            onSubmit={requestLink}
          />
        )}
      </AuthHero>
    </div>
  )
}
