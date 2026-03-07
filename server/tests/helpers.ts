import type { DecodedIdToken } from 'firebase-admin/auth'

export const HUMAN_TOKEN = 'valid-human-token'
export const AGENT_TOKEN = 'valid-agent-token'
export const INVALID_TOKEN = 'bad-token'

export const HUMAN_USER: Partial<DecodedIdToken> = {
  uid: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
}

export const AGENT_USER: Partial<DecodedIdToken> & { role: string } = {
  uid: 'agent-abc',
  name: 'SDK Agent',
  role: 'agent',
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}
