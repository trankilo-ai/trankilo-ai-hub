import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/auth'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  agentfileContent: string
}

export function Playground({ agentfileContent }: Props) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const idToken = await user?.getIdToken()
      const res = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          agentfileContent,
        }),
      })

      if (!res.ok) throw new Error('Chat request failed')
      const data = await res.json() as { content: string }
      setMessages((m) => [...m, { role: 'assistant', content: data.content }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: '🦥 Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-200">
        <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Playground 🦥</h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">Tests prompt logic against the current Agentfile instructions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 text-xs mt-8">
            <p className="text-2xl mb-2">🦥</p>
            <p>Send a message to test the agent</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                m.role === 'user'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 text-zinc-500 px-3 py-2 rounded-lg text-sm">🦥 thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-zinc-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={loading}
          className="input flex-1"
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4">
          Send
        </button>
      </form>
    </div>
  )
}
