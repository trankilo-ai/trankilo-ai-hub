import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AgentCard } from '../components/AgentCard'
import { WorkspaceMembers } from '../components/WorkspaceMembers'
import { PrivacyToggle } from '../components/PrivacyToggle'
import { workspacesApi, agentsApi } from '../services/api'
import { useAuthStore } from '../store/auth'
import type { Workspace, Agent, Role } from '../types'
import logo from '../assets/logo.png'
import { PLATFORMS, platformValue } from '../constants'

function buildAgentfileContent(params: {
  name: string
  version: string
  platform: string
  model: string
  instructions: string
}): string {
  const { name, version, platform, model, instructions } = params
  const lines = [
    `agent ${JSON.stringify(name)} {`,
    `  name         = ${JSON.stringify(name)}`,
    `  version      = ${JSON.stringify(version)}`,
  ]
  if (platform) lines.push(`  platform     = ${JSON.stringify(platform)}`)
  if (model) lines.push(`  model        = ${JSON.stringify(model)}`)
  lines.push(`  instructions = ${JSON.stringify(instructions)}`)
  lines.push('}')
  return lines.join('\n')
}

export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { user } = useAuthStore()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentVersion, setNewAgentVersion] = useState('0.0.1')
  const [newAgentPlatform, setNewAgentPlatform] = useState('')
  const [newAgentPlatformOther, setNewAgentPlatformOther] = useState('')
  const [newAgentModel, setNewAgentModel] = useState('')
  const [newAgentInstructions, setNewAgentInstructions] = useState('')
  const [instructionsDragOver, setInstructionsDragOver] = useState(false)
  const [newAgentPrivacy, setNewAgentPrivacy] = useState<'private' | 'public'>('private')
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
      setAgents(await workspacesApi.agents(workspaceId))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [workspaceId])

  async function handleInstructionsDrop(e: React.DragEvent) {
    e.preventDefault()
    setInstructionsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const name = file.name.toLowerCase()
    if (!name.endsWith('.md') && !name.endsWith('.markdown') && !name.endsWith('.txt')) return
    try {
      const text = await file.text()
      setNewAgentInstructions(text)
    } catch {
      setError('Could not read file')
    }
  }

  function handleInstructionsDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setInstructionsDragOver(true)
  }

  function handleInstructionsDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setInstructionsDragOver(false)
  }

  async function handleCreateAgent(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceId) return
    setCreating(true)
    const platformResolved =
      newAgentPlatform === 'Other' ? (newAgentPlatformOther || 'other') : platformValue(newAgentPlatform)
    const version = (newAgentVersion || '0.0.1').trim()
    const model = newAgentModel.trim()
    const content = buildAgentfileContent({
      name: newAgentName.trim(),
      version,
      platform: platformResolved,
      model,
      instructions: newAgentInstructions,
    })
    try {
      await agentsApi.create({
        name: newAgentName.trim(),
        platform: platformResolved,
        description: '',
        privacy: newAgentPrivacy,
        workspaceId,
        content,
      })
      setNewAgentName('')
      setNewAgentVersion('0.0.1')
      setNewAgentPlatform('')
      setNewAgentPlatformOther('')
      setNewAgentModel('')
      setNewAgentInstructions('')
      setNewAgentPrivacy('private')
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

      <div>
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Agents ({agents.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} workspaceId={workspaceId} />
          ))}
        </div>
      </div>

      {workspace && user && (
        <WorkspaceMembers
          workspace={workspace}
          currentUserId={user.uid}
          currentRole={currentRole}
          onUpdate={load}
        />
      )}

      {showCreateAgent && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="card p-6 max-w-lg w-full mx-4 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">Create agent</h3>
              <PrivacyToggle
                privacy={newAgentPrivacy}
                onChange={setNewAgentPrivacy}
              />
            </div>
            <form onSubmit={handleCreateAgent} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Agent name"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                required
                className="input"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Version</label>
                  <input
                    type="text"
                    placeholder="0.0.1"
                    value={newAgentVersion}
                    onChange={(e) => setNewAgentVersion(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. gpt-4o, gemini-2.5-pro, claude-sonnet-4-6"
                    value={newAgentModel}
                    onChange={(e) => setNewAgentModel(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>
              <select
                value={newAgentPlatform}
                onChange={(e) => { setNewAgentPlatform(e.target.value); setNewAgentPlatformOther('') }}
                className="input"
              >
                <option value="">Select platform…</option>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {newAgentPlatform === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify platform"
                  value={newAgentPlatformOther}
                  onChange={(e) => setNewAgentPlatformOther(e.target.value)}
                  required
                  className="input"
                />
              )}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Instructions (required)</label>
                <div
                  onDragOver={handleInstructionsDragOver}
                  onDragLeave={handleInstructionsDragLeave}
                  onDrop={handleInstructionsDrop}
                  className={`relative rounded-lg border-2 border-dashed transition-colors min-h-[120px] ${
                    instructionsDragOver ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 bg-zinc-50/50'
                  }`}
                >
                  <textarea
                    placeholder="Drop INSTRUCTIONS.md here or type/paste instructions"
                    value={newAgentInstructions}
                    onChange={(e) => setNewAgentInstructions(e.target.value)}
                    rows={5}
                    required
                    className="input w-full resize-y min-h-[120px] border-0 bg-transparent focus:ring-0 focus:border-0 placeholder:text-zinc-400"
                  />
                  {instructionsDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg bg-emerald-100/80 text-emerald-700 text-sm font-medium">
                      Drop file to use as instructions
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAgent(false)
                    setNewAgentName('')
                    setNewAgentVersion('0.0.1')
                    setNewAgentPlatform('')
                    setNewAgentPlatformOther('')
                    setNewAgentModel('')
                    setNewAgentInstructions('')
                    setInstructionsDragOver(false)
                    setNewAgentPrivacy('private')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    creating ||
                    !newAgentName.trim() ||
                    !newAgentPlatform ||
                    (newAgentPlatform === 'Other' && !newAgentPlatformOther.trim()) ||
                    !newAgentInstructions.trim()
                  }
                  className="btn-primary"
                >
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
