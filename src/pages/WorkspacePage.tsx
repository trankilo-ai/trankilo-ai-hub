import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AgentCard } from '../components/AgentCard'
import { WorkspaceMembers } from '../components/WorkspaceMembers'
import { workspacesApi, agentsApi } from '../services/api'
import { useAuthStore } from '../store/auth'
import type { Workspace, Agent, Role } from '../types'
import logo from '../assets/logo.png'

export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { user } = useAuthStore()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentPlatform, setNewAgentPlatform] = useState('')
  const [creating, setCreating] = useState(false)

  const currentRole: Role = workspace && user
    ? (workspace.members[user.uid] ?? 'Viewer')
    : 'Viewer'

  async function load() {
    if (!workspaceId) return
    setLoading(true)
    try {
      const ws = await workspacesApi.get(workspaceId)
      setWorkspace(ws)
      const all = await agentsApi.list()
      setAgents(all.filter((a) => a.workspaceId === workspaceId))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [workspaceId])

  async function handleCreateAgent(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId) return
    setCreating(true)
    try {
      await agentsApi.create({
        name: newAgentName,
        platform: newAgentPlatform,
        description: '',
        privacy: 'private',
        workspaceId,
      })
      setNewAgentName('')
      setNewAgentPlatform('')
      setShowCreateAgent(false)
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-sm">
        🦥 Loading workspace…
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      <div className="flex flex-col items-center mb-2">
        <img src={logo} alt="trankilo-ai" className="w-64 h-auto mb-6" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{workspace?.name}</h1>
        </div>
        {(currentRole === 'Admin' || currentRole === 'Editor') && (
          <button onClick={() => setShowCreateAgent(true)} className="btn-primary">
            + New agent
          </button>
        )}
      </div>

      {workspace && user && (
        <WorkspaceMembers
          workspace={workspace}
          currentUserId={user.uid}
          currentRole={currentRole}
          onUpdate={load}
        />
      )}

      <div>
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Agents ({agents.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} workspaceId={workspaceId} />
          ))}
        </div>
      </div>

      {showCreateAgent && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="card p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-900">Create agent</h3>
            <form onSubmit={handleCreateAgent} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Agent name"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                required
                className="input"
              />
              <input
                type="text"
                placeholder="Platform (e.g. LangChain)"
                value={newAgentPlatform}
                onChange={(e) => setNewAgentPlatform(e.target.value)}
                className="input"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateAgent(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? '🦥 Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-xs text-zinc-400">
        <Link to="/" className="hover:text-zinc-600">← Back to Agent hub</Link>
      </div>
    </div>
  )
}
