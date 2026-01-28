type Props = {
  email: string
  isLoading: boolean
  status: string | null
  onEmailChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export default function AuthForm({
  email,
  isLoading,
  status,
  onEmailChange,
  onSubmit
}: Props) {
  return (
    <form className="form" onSubmit={onSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="you@example.com"
        required
      />
      <button className="button" type="submit" disabled={isLoading}>
        {isLoading ? 'Sending…' : 'Send magic link'}
      </button>
      {status && <p className="status-text">{status}</p>}
    </form>
  )
}
