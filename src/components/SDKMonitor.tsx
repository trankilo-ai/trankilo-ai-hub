import type { HeartbeatEntry } from '../types'

interface Props {
  beats: HeartbeatEntry[]
  loading?: boolean
}

function timeSince(ts: string) {
  const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export function SDKMonitor({ beats, loading }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">SDK Monitor</h3>
      </div>

      {loading && (
        <p className="text-xs text-zinc-400 px-4 py-4 text-center">🦥 Loading…</p>
      )}

      {!loading && beats.length === 0 && (
        <p className="text-xs text-zinc-400 px-4 py-4 text-center">No active SDK clients</p>
      )}

      {!loading && beats.length > 0 && (
        <div className="divide-y divide-zinc-100">
          {beats.map((b, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-600 font-mono">
                  {(b.metadata?.version as string) ?? 'unknown'}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">{timeSince(b.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
