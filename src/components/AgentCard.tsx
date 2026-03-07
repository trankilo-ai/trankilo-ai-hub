import { Link } from 'react-router-dom'
import type { Agent } from '../types'

interface Props {
  agent: Agent
  workspaceId?: string
}

export function AgentCard({ agent, workspaceId }: Props) {
  const href = workspaceId
    ? `/workspace/${workspaceId}/agent/${agent.id}`
    : `/agent/${agent.id}`

  return (
    <Link to={href} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 text-sm leading-snug">{agent.name}</h3>
        <span className={agent.privacy === 'public' ? 'badge-public' : 'badge-private'}>
          {agent.privacy}
        </span>
      </div>

      {agent.description && (
        <p className="text-xs text-zinc-500 line-clamp-2">{agent.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        {agent.platform && (
          <span className="badge bg-zinc-100 text-zinc-600">{agent.platform}</span>
        )}
        <span className="text-xs text-zinc-400 ml-auto">v{agent.currentVersion}</span>
      </div>
    </Link>
  )
}
