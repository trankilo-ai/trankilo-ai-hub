import admin from 'firebase-admin'

let initialized = false

export function initFirebase() {
  if (initialized) return
  initialized = true

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId,
    })
  } else {
    admin.initializeApp({ projectId: projectId ?? 'demo-project' })
  }
}

export function getDb() {
  return admin.firestore()
}

export function getAuth() {
  return admin.auth()
}
