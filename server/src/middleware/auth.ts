import type { Request, Response, NextFunction } from 'express'
import { getAuth } from '../services/firebase'

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' })
    return
  }

  const token = header.slice(7)
  try {
    const decoded = await getAuth().verifyIdToken(token)
    req.user = decoded as typeof req.user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireAgentRole(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== 'agent') {
    res.status(403).json({ message: 'Agent role required' })
    return
  }
  next()
}
