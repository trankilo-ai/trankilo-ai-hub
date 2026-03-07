import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireAgentRole } from '../middleware/auth'
import { recordBeat, getBeats } from '../services/heartbeats'

const router = Router({ mergeParams: true })

router.post('/', authMiddleware, requireAgentRole, async (req, res) => {
  const { metadata = {} } = req.body as { metadata?: Record<string, unknown> }
  await recordBeat(req.params.id, metadata)
  res.json({ message: '🦥 heartbeat recorded' })
})

router.get('/', authMiddleware, async (req, res) => {
  const beats = await getBeats(req.params.id)
  res.json(beats)
})

export default router
