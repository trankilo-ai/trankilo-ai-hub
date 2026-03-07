import { getDb } from './firebase'
import type { HeartbeatEntry } from '../types'

const COLLECTION = 'heartbeats'
const MAX_BEATS = 10

export async function recordBeat(
  agentId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  const ref = getDb().collection(COLLECTION).doc(agentId)
  const doc = await ref.get()

  const newBeat: HeartbeatEntry = {
    timestamp: new Date().toISOString(),
    metadata,
  }

  if (!doc.exists) {
    await ref.set({ beats: [newBeat] })
    return
  }

  const existing: HeartbeatEntry[] = doc.data()?.beats ?? []
  const updated = [newBeat, ...existing].slice(0, MAX_BEATS)
  await ref.update({ beats: updated })
}

export async function getBeats(agentId: string): Promise<HeartbeatEntry[]> {
  const doc = await getDb().collection(COLLECTION).doc(agentId).get()
  if (!doc.exists) return []
  return doc.data()?.beats ?? []
}
