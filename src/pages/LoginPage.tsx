import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginCard } from '../components/LoginCard'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  useEffect(() => {
    if (!loading && user) navigate(redirect, { replace: true })
  }, [user, loading, navigate, redirect])

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <LoginCard onSuccess={() => navigate(redirect, { replace: true })} />
    </div>
  )
}
