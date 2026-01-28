type Props = {
  email: string
  isLoading: boolean
  onSignOut: () => void
}

export default function SignedInPanel({ email, isLoading, onSignOut }: Props) {
  return (
    <div className="panel">
      <p>
        Signed in as <strong>{email}</strong>
      </p>
      <button className="button" onClick={onSignOut} disabled={isLoading}>
        Sign out
      </button>
    </div>
  )
}
