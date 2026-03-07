import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AgentfileEditor } from '../components/AgentfileEditor'
import { VersionHistory } from '../components/VersionHistory'
import { Playground } from '../components/Playground'
import { PrivacyToggle } from '../components/PrivacyToggle'
import { SDKMonitor } from '../components/SDKMonitor'
import { AgentLog } from '../components/AgentLog'
import { agentsApi, agentfileApi, heartbeatApi, logsApi } from '../services/api'
import type { Agent, AgentVersion, HeartbeatEntry, LogEntry, Role } from '../types'

type Tab = 'editor' | 'playground' | 'monitor' | 'log'

export function AgentDetailPage() {
  const { workspaceId, agentId } = useParams<{ workspaceId: string; agentId: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [agentfileContent, setAgentfileContent] = useState('')
  const [versions, setVersions] = useState<AgentVersion[]>([])
  const [beats, setBeats] = useState<HeartbeatEntry[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('editor')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  const currentRole: Role = 'Editor' as Role

  async function load() {
    if (!agentId) return
    setLoading(true)
    try {
      const [a, af, vers, hb, lg] = await Promise.all([
        agentsApi.get(agentId),
        agentfileApi.get(agentId),
        agentfileApi.versions(agentId),
        heartbeatApi.get(agentId),
        logsApi.get(agentId),
      ])
      setAgent(a)
      setAgentfileContent(af.content)
      setVersions(vers)
      setBeats(hb)
      setLogs(lg)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [agentId])

  async function handleSave(content: string) {
    if (!agentId) return
    await agentfileApi.save(agentId, content)
    setAgentfileContent(content)
    const vers = await agentfileApi.versions(agentId)
    setVersions(vers)
    const a = await agentsApi.get(agentId)
    setAgent(a)
  }

  async function handlePublish() {
    if (!agentId) return
    await agentsApi.publish(agentId)
    const lg = await logsApi.get(agentId)
    setLogs(lg)
  }

  async function handleVersionSelect(version: string) {
    if (!agentId) return
    setSelectedVersion(version)
    const { content } = await agentfileApi.getVersion(agentId, version)
    setAgentfileContent(content)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-sm">
        🦥 Loading agent…
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-600 text-sm">{error ?? 'Agent not found'}</p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'editor', label: 'Agentfile' },
    { id: 'playground', label: 'Playground 🦥' },
    { id: 'monitor', label: 'SDK Monitor' },
    { id: 'log', label: 'Activity Log' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4 h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to={workspaceId ? `/workspace/${workspaceId}` : '/'}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              ← Back
            </Link>
            <span className="text-zinc-300">/</span>
            <h1 className="text-lg font-semibold text-zinc-900">{agent.name}</h1>
            <span className={agent.privacy === 'public' ? 'badge-public' : 'badge-private'}>
              {agent.privacy}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            v{agent.currentVersion} · {agent.platform}
          </p>
        </div>
        <PrivacyToggle
          privacy={agent.privacy}
          onChange={async (p) => {
            setAgent({ ...agent, privacy: p })
          }}
          disabled={currentRole === 'Viewer'}
        />
      </div>

      <div className="flex border-b border-zinc-200 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        {activeTab === 'editor' && (
          <>
            <div className="flex-1 min-w-0 border border-zinc-200 rounded-xl overflow-hidden flex flex-col">
              <AgentfileEditor
                content={agentfileContent}
                role={currentRole}
                onSave={handleSave}
                onPublish={handlePublish}
              />
            </div>
            <div className="w-64 flex-shrink-0 border border-zinc-200 rounded-xl overflow-hidden">
              <VersionHistory
                versions={versions}
                currentVersion={selectedVersion ?? agent.currentVersion}
                onSelect={handleVersionSelect}
              />
            </div>
          </>
        )}

        {activeTab === 'playground' && (
          <div className="flex-1 border border-zinc-200 rounded-xl overflow-hidden flex flex-col">
            <Playground agentfileContent={agentfileContent} />
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="flex-1 border border-zinc-200 rounded-xl overflow-hidden">
            <SDKMonitor beats={beats} />
          </div>
        )}

        {activeTab === 'log' && (
          <div className="flex-1 border border-zinc-200 rounded-xl overflow-hidden">
            <AgentLog entries={logs} />
          </div>
        )}
      </div>
    </div>
  )
}
