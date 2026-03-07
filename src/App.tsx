import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import { useAuthInit } from './hooks/useAuth'
import { Navbar } from './components/Navbar'
import { LoginPage } from './pages/LoginPage'
import { WorkspacesPage } from './pages/WorkspacesPage'
import { WorkspacePage } from './pages/WorkspacePage'
import { AgentDetailPage } from './pages/AgentDetailPage'
import { PublicAgentPage } from './pages/PublicAgentPage'
import { AcceptInvitePage } from './pages/AcceptInvitePage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-400 text-sm">
        🦥 Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  useAuthInit()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div className="min-h-screen bg-canvas">
              <Navbar />
              <Routes>
                <Route path="/" element={<WorkspacesPage />} />
                <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
                <Route path="/workspace/:workspaceId/agent/:agentId" element={<AgentDetailPage />} />
                <Route path="/agent/:agentId" element={<PublicAgentPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
