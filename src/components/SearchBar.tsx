import { useState, useEffect, useRef } from 'react'

interface Props {
  onSearch: (q: string, platform: string) => void
  placeholder?: string
}

const PLATFORMS = ['', 'LangChain', 'LlamaIndex', 'AutoGen', 'CrewAI', 'OpenAI', 'Anthropic', 'Other']

export function SearchBar({ onSearch, placeholder = 'Search agents…' }: Props) {
  const [q, setQ] = useState('')
  const [platform, setPlatform] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(q, platform)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q, platform, onSearch])

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="input pl-9"
        />
      </div>
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        className="input w-36 flex-shrink-0"
      >
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>{p || 'All platforms'}</option>
        ))}
      </select>
    </div>
  )
}
