import { useState } from 'react'
import Editor from '@monaco-editor/react'
import type { Role } from '../types'

interface Props {
  content: string
  role: Role | null
  onSave: (content: string) => Promise<void>
  onPublish: () => Promise<void>
}

export function AgentfileEditor({ content, role, onSave, onPublish }: Props) {
  const [value, setValue] = useState(content)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dirty, setDirty] = useState(false)

  const isViewer = role === 'Viewer'

  function handleChange(v: string | undefined) {
    setValue(v ?? '')
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(value)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublishConfirm() {
    setPublishing(true)
    setShowConfirm(false)
    try {
      await onPublish()
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-white">
        <span className="text-xs font-mono text-zinc-500">Agentfile.hcl</span>
        {!isViewer && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {saving ? '🦥 Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={publishing || dirty}
              className="btn-primary text-xs px-3 py-1.5"
            >
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        )}
        {isViewer && (
          <span className="badge bg-zinc-100 text-zinc-500 text-xs">View only</span>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="hcl"
          value={value}
          onChange={handleChange}
          options={{
            readOnly: isViewer,
            fontSize: 13,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            tabSize: 2,
            wordWrap: 'on',
          }}
          theme="vs-light"
        />
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="card p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-900">Publish agent?</h3>
            <p className="text-sm text-zinc-600">
              This will make the current Agentfile version live. Are you sure?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handlePublishConfirm} className="btn-primary">Publish 🦥</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
