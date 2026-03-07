import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getLogs } from '../services/logs'

const router = Router({ mergeParams: true })

router.get('/', authMiddleware, async (req, res) => {
  const entries = await getLogs(req.params.id)
  res.json(entries)
})

export default router
