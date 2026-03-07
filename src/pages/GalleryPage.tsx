import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AgentCard } from '../components/AgentCard'
import { SearchBar } from '../components/SearchBar'
import { agentsApi } from '../services/api'
import type { Agent } from '../types'
import logo from '../assets/logo.png'

export function GalleryPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (q = '', platform = '') => {
    setLoading(true)
    try {
      const data = q || platform
        ? await agentsApi.search(q, platform)
        : await agentsApi.list()
      setAgents(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <img src={logo} alt="trankilo-ai" className="w-56 h-auto mb-4" />
        <h1 className="text-3xl font-semibold text-zinc-900">Agent Registry 🦥</h1>
        <p className="text-sm text-zinc-500 mt-2">Discover and explore public agents</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <SearchBar onSearch={load} />
        <Link to="/workspace/new" className="btn-primary text-sm ml-4 flex-shrink-0">
          + New workspace
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-zinc-400 text-sm">
          Loading agents…
        </div>
      )}

      {!loading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-400">
          <span className="text-4xl">🦥</span>
          <p className="text-sm">No agents found</p>
        </div>
      )}

      {!loading && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      )}
    </div>
  )
}
