import './__mocks__/services'
import request from 'supertest'
import app from '../src/index'
import { authHeader, HUMAN_TOKEN } from './helpers'
import { appendLog, getLogs } from '../src/services/logs'

describe('Auto-logging on agent mutations', () => {
  beforeEach(() => jest.clearAllMocks())

  it('POST /api/agents logs "Agent created"', async () => {
    await request(app)
      .post('/api/agents')
      .set(authHeader(HUMAN_TOKEN))
      .send({ name: 'Test', workspaceId: 'ws-1' })
    expect(appendLog).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ description: 'Agent created' }),
    )
  })

  it('PUT /api/agents/:id/agentfile logs "Agentfile pushed"', async () => {
    await request(app)
      .put('/api/agents/agent-1/agentfile')
      .set(authHeader(HUMAN_TOKEN))
      .send({ content: 'agent "X" {\n  version = "2.0.0"\n}' })
    expect(appendLog).toHaveBeenCalledWith(
      'agent-1',
      expect.objectContaining({ description: 'Agentfile pushed' }),
    )
  })

  it('POST /api/agents/:id/publish logs "Agent published"', async () => {
    await request(app)
      .post('/api/agents/agent-1/publish')
      .set(authHeader(HUMAN_TOKEN))
    expect(appendLog).toHaveBeenCalledWith(
      'agent-1',
      expect.objectContaining({ description: 'Agent published' }),
    )
  })

  it('DELETE /api/agents/:id logs "Agent deleted"', async () => {
    await request(app)
      .delete('/api/agents/agent-1')
      .set(authHeader(HUMAN_TOKEN))
    expect(appendLog).toHaveBeenCalledWith(
      'agent-1',
      expect.objectContaining({ description: 'Agent deleted' }),
    )
  })
})

describe('GET /api/agents/:id/logs', () => {
  it('returns log entries for an agent', async () => {
    const res = await request(app)
      .get('/api/agents/agent-1/logs')
      .set(authHeader(HUMAN_TOKEN))
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(getLogs).toHaveBeenCalledWith('agent-1')
  })

  it('entries have required fields', async () => {
    const res = await request(app)
      .get('/api/agents/agent-1/logs')
      .set(authHeader(HUMAN_TOKEN))
    const entry = res.body[0]
    expect(entry).toHaveProperty('timestamp')
    expect(entry).toHaveProperty('user')
    expect(entry).toHaveProperty('userId')
    expect(entry).toHaveProperty('description')
  })
})
