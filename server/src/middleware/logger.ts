import type { Request, Response, NextFunction } from 'express'
import { appendLog } from '../services/logs'

export function autoLog(description: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const agentId = req.params.id
    if (!agentId || !req.user) {
      next()
      return
    }

    const originalJson = res.json.bind(res)
    res.json = (body) => {
      if (res.statusCode < 400) {
        appendLog(agentId, {
          user: req.user!.name ?? req.user!.email ?? req.user!.uid,
          userId: req.user!.uid,
          description: description(req),
        }).catch(console.error)
      }
      return originalJson(body)
    }

    next()
  }
}
