import { FieldValue } from 'firebase-admin/firestore'
import { getDb } from './firebase'
import type { Workspace, Role, WorkspaceInvite } from '../types'

const COLLECTION = 'workspaces'

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const doc = await getDb().collection(COLLECTION).doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Workspace
}

export async function createWorkspace(name: string, ownerId: string): Promise<Workspace> {
  const data = {
    name,
    owner: ownerId,
    members: { [ownerId]: 'Admin' as Role },
    createdAt: FieldValue.serverTimestamp(),
  }
  const ref = await getDb().collection(COLLECTION).add(data)
  const doc = await ref.get()
  return { id: doc.id, ...doc.data() } as Workspace
}

export async function getMemberRole(
  workspaceId: string,
  userId: string,
): Promise<Role | null> {
  const ws = await getWorkspace(workspaceId)
  if (!ws) return null
  return ws.members[userId] ?? null
}

export async function listUserWorkspaces(userId: string): Promise<Workspace[]> {
  const snap = await getDb()
    .collection(COLLECTION)
    .where(`members.${userId}`, '!=', null)
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Workspace))
}

export async function createInvite(
  workspaceId: string,
  email: string,
  role: Role,
  invitedBy: string,
): Promise<WorkspaceInvite> {
  const data = {
    email,
    role,
    invitedBy,
    status: 'pending' as const,
    invitedAt: FieldValue.serverTimestamp(),
  }
  const ref = await getDb().collection(COLLECTION).doc(workspaceId).collection('invites').add(data)
  const doc = await ref.get()
  return { id: doc.id, ...doc.data() } as WorkspaceInvite
}

export async function listInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
  const snap = await getDb()
    .collection(COLLECTION)
    .doc(workspaceId)
    .collection('invites')
    .where('status', '==', 'pending')
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkspaceInvite))
}

export async function acceptInvite(
  workspaceId: string,
  inviteId: string,
  userId: string,
  userEmail: string,
): Promise<void> {
  const ref = getDb().collection(COLLECTION).doc(workspaceId).collection('invites').doc(inviteId)
  const doc = await ref.get()

  if (!doc.exists) throw Object.assign(new Error('Invitation not found or already revoked'), { status: 404 })

  const invite = doc.data() as { email: string; role: Role; status: string }

  if (invite.status !== 'pending') throw Object.assign(new Error('Invitation has already been used'), { status: 409 })

  if (invite.email.toLowerCase() !== userEmail.toLowerCase())
    throw Object.assign(new Error('This invitation was sent to a different email address'), { status: 403 })

  await getDb().runTransaction(async (tx) => {
    tx.update(getDb().collection(COLLECTION).doc(workspaceId), { [`members.${userId}`]: invite.role })
    tx.update(ref, { status: 'accepted', acceptedAt: FieldValue.serverTimestamp(), acceptedBy: userId })
  })
}

export async function deleteInvite(workspaceId: string, inviteId: string): Promise<void> {
  await getDb()
    .collection(COLLECTION)
    .doc(workspaceId)
    .collection('invites')
    .doc(inviteId)
    .delete()
}

export async function setMemberRole(
  workspaceId: string,
  userId: string,
  role: Role,
): Promise<void> {
  await getDb()
    .collection(COLLECTION)
    .doc(workspaceId)
    .update({ [`members.${userId}`]: role })
}
