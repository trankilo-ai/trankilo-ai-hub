export type Role = 'Admin' | 'Editor' | 'Viewer'

export interface Agent {
  id: string
  name: string
  platform: string
  description: string
  privacy: 'public' | 'private'
  workspaceId: string
  ownerId: string
  currentVersion: string
  createdAt: string
  updatedAt: string
}

export interface AgentVersion {
  id: string
  version: string
  savedAt: string
  savedBy: string
}

export interface Workspace {
  id: string
  name: string
  owner: string
  members: Record<string, Role>
}

export interface WorkspaceMember {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  role: Role
}

export interface WorkspaceInvite {
  id: string
  email: string
  role: Role
  invitedBy: string
  status: 'pending'
  invitedAt: string
}

export interface HeartbeatEntry {
  timestamp: string
  metadata: Record<string, unknown>
}

export interface LogEntry {
  timestamp: string
  user: string
  userId: string
  description: string
  comment?: string
}

export interface ApiError {
  message: string
  status: number
}

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role?: string
}
