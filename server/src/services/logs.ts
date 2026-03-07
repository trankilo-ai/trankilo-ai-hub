import { FieldValue } from 'firebase-admin/firestore'
import { getDb } from './firebase'
import type { LogEntry } from '../types'

const COLLECTION = 'logs'

export async function appendLog(
  agentId: string,
  entry: Omit<LogEntry, 'timestamp'>,
): Promise<void> {
  const ref = getDb().collection(COLLECTION).doc(agentId)
  const doc = await ref.get()

  const newEntry = { ...entry, timestamp: new Date().toISOString() }

  if (!doc.exists) {
    await ref.set({ entries: [newEntry] })
  } else {
    await ref.update({ entries: FieldValue.arrayUnion(newEntry) })
  }
}

export async function getLogs(agentId: string): Promise<LogEntry[]> {
  const doc = await getDb().collection(COLLECTION).doc(agentId).get()
  if (!doc.exists) return []
  const entries: LogEntry[] = doc.data()?.entries ?? []
  return entries.sort(
    (a, b) => new Date(b.timestamp as unknown as string).getTime() - new Date(a.timestamp as unknown as string).getTime(),
  )
}
