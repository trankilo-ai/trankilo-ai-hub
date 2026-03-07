import admin from 'firebase-admin'

function getBucket() {
  return admin.storage().bucket(process.env.GCS_BUCKET_NAME ?? `${process.env.FIREBASE_PROJECT_ID}.appspot.com`)
}

function objectPath(agentId: string, version: string): string {
  return `agents/${agentId}/Agentfile.${version}`
}

export async function uploadAgentfile(
  agentId: string,
  version: string,
  content: string,
): Promise<void> {
  const file = getBucket().file(objectPath(agentId, version))
  await file.save(content, {
    contentType: 'text/plain',
    metadata: { agentId, version },
  })
}

export async function downloadAgentfile(
  agentId: string,
  version: string,
): Promise<string> {
  const file = getBucket().file(objectPath(agentId, version))
  const [contents] = await file.download()
  return contents.toString('utf-8')
}

export async function agentfileExists(
  agentId: string,
  version: string,
): Promise<boolean> {
  const [exists] = await getBucket().file(objectPath(agentId, version)).exists()
  return exists
}
