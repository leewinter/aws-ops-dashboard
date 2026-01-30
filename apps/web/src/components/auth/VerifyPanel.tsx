type Props = {
  isLoading: boolean
  status: string | null
}

export default function VerifyPanel({ isLoading, status }: Props) {
  return (
    <div className="panel">
      <p>{isLoading ? 'Signing you in...' : status}</p>
    </div>
  )
}
