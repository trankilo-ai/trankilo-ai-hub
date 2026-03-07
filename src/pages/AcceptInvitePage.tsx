import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { workspacesApi } from '../services/api'
import { useAuthStore } from '../store/auth'
import logo from '../assets/logo.png'

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuthStore()

  const workspaceId = searchParams.get('workspaceId')
  const inviteId = searchParams.get('inviteId')

  const [status, setStatus] = useState<'idle' | 'accepting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true })
      return
    }
    if (!workspaceId || !inviteId) {
      setError('Invalid invitation link.')
      setStatus('error')
      return
    }
    if (status !== 'idle') return

    setStatus('accepting')
    workspacesApi.acceptInvite(workspaceId, inviteId)
      .then((ws) => {
        setStatus('success')
        setTimeout(() => navigate(`/workspace/${ws.id}`, { replace: true }), 1500)
      })
      .catch((e: Error) => {
        setError(e.message)
        setStatus('error')
      })
  }, [user, authLoading])

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
        <img src={logo} alt="trankilo-ai" className="w-48 h-auto" />

        {authLoading || status === 'idle' || status === 'accepting' ? (
          <>
            <p className="text-zinc-500 text-sm">🦥 Accepting your invitation…</p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="text-4xl">🎉</div>
            <p className="text-zinc-800 font-medium">You're in! Redirecting to your workspace…</p>
          </>
        ) : (
          <>
            <div className="text-4xl">😔</div>
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button onClick={() => navigate('/')} className="btn-secondary text-sm">
              Back to home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
