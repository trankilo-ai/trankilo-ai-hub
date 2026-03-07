import { useEffect, useState } from 'react'
import type { Workspace, WorkspaceMember, WorkspaceInvite, Role } from '../types'
import { workspacesApi } from '../services/api'

interface Props {
  workspace: Workspace
  currentUserId: string
  currentRole: Role
  onUpdate: () => void
}

const ROLES: Role[] = ['Admin', 'Editor', 'Viewer']

export function WorkspaceMembers({ workspace, currentUserId, currentRole, onUpdate }: Props) {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [invites, setInvites] = useState<WorkspaceInvite[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('Viewer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const isAdmin = currentRole === 'Admin'
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  useEffect(() => {
    workspacesApi.members(workspace.id).then(setMembers).catch(() => {})
    workspacesApi.invites(workspace.id).then(setInvites).catch(() => {})
  }, [workspace.id, workspace.members])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (emailError || !EMAIL_RE.test(inviteEmail)) return
    setLoading(true)
    setError(null)
    try {
      await workspacesApi.invite(workspace.id, inviteEmail, inviteRole)
      setInviteEmail('')
      setShowInvite(false)
      workspacesApi.invites(workspace.id).then(setInvites).catch(() => {})
      onUpdate()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, role: Role) {
    try {
      await workspacesApi.setRole(workspace.id, userId, role)
      onUpdate()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <h2 className="text-sm font-semibold text-zinc-900">Members</h2>
        {isAdmin && (
          <button onClick={() => setShowInvite(true)} className="btn-secondary text-xs px-3 py-1.5">
            + Invite
          </button>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center px-5 py-2 border-b border-zinc-100 text-xs text-zinc-400 uppercase tracking-wide">
          <span className="flex-[2]">Member</span>
          <span className="flex-[2]">Email</span>
          <span className="flex-1">Role</span>
        </div>

        {members.map(({ uid, displayName, email, photoURL, role }) => (
          <div key={uid} className="flex items-center px-5 py-3 border-b border-zinc-100 last:border-0">
            <div className="flex-[2] flex items-center gap-3 min-w-0">
              {photoURL ? (
                <img src={photoURL} alt={displayName ?? ''} className="w-7 h-7 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0 text-xs text-zinc-500 font-medium">
                  {(displayName ?? email ?? uid).charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-zinc-800 font-medium truncate">
                {displayName ?? email ?? uid}
                {uid === currentUserId && <span className="ml-1.5 text-[11px] text-zinc-400 font-normal">(you)</span>}
              </span>
            </div>
            <span className="flex-[2] text-xs text-zinc-500 truncate">{email ?? '—'}</span>
            <div className="flex-1">
              {isAdmin && uid !== currentUserId ? (
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(uid, e.target.value as Role)}
                  className="text-xs border border-zinc-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <span className={`badge-${role.toLowerCase()}`}>{role}</span>
              )}
            </div>
          </div>
        ))}

        {invites.map(({ id, email, role }) => (
          <div key={id} className="flex items-center px-5 py-3 border-b border-zinc-100 last:border-0 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex-[2] flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 text-xs text-zinc-400 font-medium">
                {email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-zinc-500 italic truncate">{email}</span>
            </div>
            <span className="flex-[2] text-xs text-zinc-400 truncate">{email}</span>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-zinc-400 italic">{role}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                Pending
              </span>
              {isAdmin && (
                <button
                  onClick={async () => {
                    await workspacesApi.deleteInvite(workspace.id, id)
                    setInvites((prev) => prev.filter((i) => i.id !== id))
                  }}
                  title="Revoke invite"
                  className="ml-auto p-1 text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-600 px-5 py-2">{error}</p>}

      {showInvite && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="card p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-900">Invite member</h3>
            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <input
                  type="email"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => {
                    const val = e.target.value
                    setInviteEmail(val)
                    setEmailError(val && !EMAIL_RE.test(val) ? 'Invalid email address' : null)
                  }}
                  required
                  className={`input ${emailError ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="input"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? '🦥 Sending…' : 'Send invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
