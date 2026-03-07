import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspacesApi } from '../services/api'
import type { Workspace } from '../types'
import logo from '../assets/logo.png'

export function WorkspacesPage() {
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    workspacesApi.list()
      .then((ws) => {
        if (ws.length === 1) {
          navigate(`/workspace/${ws[0].id}`, { replace: true })
        } else {
          setWorkspaces(ws)
          setLoading(false)
        }
      })
      .catch((e) => {
        setError((e as Error).message)
        setLoading(false)
      })
  }, [navigate])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const ws = await workspacesApi.create(name)
      navigate(`/workspace/${ws.id}`)
    } catch (e) {
      setError((e as Error).message)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-sm">
        🦥 Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <img src={logo} alt="trankilo-ai" className="w-64 h-auto mb-8" />
        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Your workspaces</h1>
        <p className="text-sm text-zinc-500 mb-8">Select a workspace to continue</p>

        {error && <p className="text-sm text-red-600 mb-4 w-full">{error}</p>}

        {workspaces.length > 0 && (
          <div className="flex flex-col gap-3 mb-6 w-full">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                className="card px-5 py-4 text-left hover:shadow-md transition-shadow flex items-center justify-between group"
              >
                <div>
                  <p className="font-medium text-zinc-900">{ws.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {Object.keys(ws.members).length} member{Object.keys(ws.members).length !== 1 ? 's' : ''}
                  </p>
                </div>
                <svg className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} className="btn-primary w-full">
            + New workspace
          </button>
        ) : (
          <form onSubmit={handleCreate} className="card p-5 flex flex-col gap-3 w-full">
            <h2 className="text-sm font-semibold text-zinc-800">Create workspace</h2>
            <input
              type="text"
              placeholder="Workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="input"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? '🦥 Creating…' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
