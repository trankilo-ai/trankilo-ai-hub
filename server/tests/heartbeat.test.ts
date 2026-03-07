import './__mocks__/services'
import request from 'supertest'
import app from '../src/index'
import { authHeader, HUMAN_TOKEN, AGENT_TOKEN } from './helpers'
import { recordBeat, getBeats } from '../src/services/heartbeats'

describe('POST /api/agents/:id/heartbeat', () => {
  it('requires agent role — rejects human token with 403', async () => {
    const res = await request(app)
      .post('/api/agents/agent-1/heartbeat')
      .set(authHeader(HUMAN_TOKEN))
      .send({})
    expect(res.status).toBe(403)
    expect(recordBeat).not.toHaveBeenCalled()
  })

  it('accepts agent token and records beat', async () => {
    const res = await request(app)
      .post('/api/agents/agent-1/heartbeat')
      .set(authHeader(AGENT_TOKEN))
      .send({ metadata: { version: '1.0.0' } })
    expect(res.status).toBe(200)
    expect(recordBeat).toHaveBeenCalledWith('agent-1', { version: '1.0.0' })
  })

  it('returns 401 with no token', async () => {
    const res = await request(app).post('/api/agents/agent-1/heartbeat').send({})
    expect(res.status).toBe(401)
  })
})

describe('GET /api/agents/:id/heartbeat', () => {
  it('returns last beats array', async () => {
    const res = await request(app)
      .get('/api/agents/agent-1/heartbeat')
      .set(authHeader(HUMAN_TOKEN))
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(getBeats).toHaveBeenCalledWith('agent-1')
  })

  it('beats array is capped at 10 entries', async () => {
    const mockBeats = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date().toISOString(),
      metadata: { version: `1.0.${i}` },
    }))
    ;(getBeats as jest.Mock).mockResolvedValueOnce(mockBeats)

    const res = await request(app)
      .get('/api/agents/agent-1/heartbeat')
      .set(authHeader(HUMAN_TOKEN))
    expect(res.status).toBe(200)
    expect(res.body.length).toBeLessThanOrEqual(10)
  })
})
