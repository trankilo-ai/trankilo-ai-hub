import type { LogEntry } from '../types'

interface Props {
  entries: LogEntry[]
  loading?: boolean
}

export function AgentLog({ entries, loading }: Props) {
  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Activity log</h3>
      </div>

      {loading && (
        <p className="text-xs text-zinc-400 px-4 py-4 text-center">🦥 Loading…</p>
      )}

      {!loading && entries.length === 0 && (
        <p className="text-xs text-zinc-400 px-4 py-4 text-center">No activity yet</p>
      )}

      {!loading && (
        <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
          {entries.map((e, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-zinc-800">{e.description}</span>
                <span className="text-[11px] text-zinc-400">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">{e.user}</p>
              {e.comment && (
                <p className="text-[11px] text-zinc-400 italic mt-0.5">"{e.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
