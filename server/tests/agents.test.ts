import './__mocks__/services'
import request from 'supertest'
import app from '../src/index'
import { authHeader, HUMAN_TOKEN } from './helpers'
import { appendLog } from '../src/services/logs'

describe('GET /api/agents', () => {
  it('returns public agent list without auth', async () => {
    const res = await request(app).get('/api/agents')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('id')
  })
})

describe('GET /api/agents/search', () => {
  it('returns array for search query', async () => {
    const res = await request(app).get('/api/agents/search?q=crm')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('GET /api/agents/:id', () => {
  it('returns public agent without auth', async () => {
    const res = await request(app).get('/api/agents/agent-1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('agent-1')
  })

  it('returns 404 for unknown agent', async () => {
    const res = await request(app)
      .get('/api/agents/nonexistent')
      .set(authHeader(HUMAN_TOKEN))
    expect(res.status).toBe(404)
  })
})

describe('POST /api/agents', () => {
  it('creates agent and returns 201', async () => {
    const res = await request(app)
      .post('/api/agents')
      .set(authHeader(HUMAN_TOKEN))
      .send({ name: 'New Agent', workspaceId: 'ws-1' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('logs the create action', async () => {
    await request(app)
      .post('/api/agents')
      .set(authHeader(HUMAN_TOKEN))
      .send({ name: 'Logged Agent', workspaceId: 'ws-1' })
    expect(appendLog).toHaveBeenCalled()
  })

  it('returns 400 when name missing', async () => {
    const res = await request(app)
      .post('/api/agents')
      .set(authHeader(HUMAN_TOKEN))
      .send({ workspaceId: 'ws-1' })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/agents/:id', () => {
  it('returns 204 for Admin', async () => {
    const res = await request(app)
      .delete('/api/agents/agent-1')
      .set(authHeader(HUMAN_TOKEN))
    expect(res.status).toBe(204)
  })
})

describe('POST /api/agents/:id/publish', () => {
  it('publishes agent and logs action', async () => {
    const res = await request(app)
      .post('/api/agents/agent-1/publish')
      .set(authHeader(HUMAN_TOKEN))
    expect(res.status).toBe(200)
    expect(appendLog).toHaveBeenCalled()
  })
})
