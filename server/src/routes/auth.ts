import { Router } from 'express'
import { getAuth } from '../services/firebase'

const router = Router()

router.post('/login', async (req, res) => {
  const { idToken } = req.body as { idToken?: string }
  if (!idToken) {
    res.status(400).json({ message: 'idToken required' })
    return
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken)
    res.json({
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
      photoURL: decoded.picture ?? null,
      role: decoded.role ?? null,
    })
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
})

export default router
