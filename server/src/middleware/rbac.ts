import type { Request, Response, NextFunction } from 'express'
import { getMemberRole } from '../services/workspaces'
import { getAgent } from '../services/agents'
import type { Role } from '../types'

const ROLE_RANK: Record<Role, number> = { Admin: 3, Editor: 2, Viewer: 1 }

export function requireWorkspaceRole(minRole: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const workspaceId = req.params.workspaceId ?? req.body?.workspaceId
    if (!workspaceId) {
      res.status(400).json({ message: 'workspaceId required' })
      return
    }

    const role = await getMemberRole(workspaceId, req.user!.uid)
    if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
      res.status(403).json({ message: 'Insufficient permissions' })
      return
    }

    next()
  }
}

export function requireAgentWorkspaceRole(minRole: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const agentId = req.params.id
    if (!agentId) {
      res.status(400).json({ message: 'agentId required' })
      return
    }

    const agent = await getAgent(agentId)
    if (!agent) {
      res.status(404).json({ message: 'Agent not found' })
      return
    }

    const role = await getMemberRole(agent.workspaceId, req.user!.uid)
    if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
      res.status(403).json({ message: 'Insufficient permissions' })
      return
    }

    next()
  }
}
