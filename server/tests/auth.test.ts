import './__mocks__/services'
import request from 'supertest'
import app from '../src/index'
import { authHeader, HUMAN_TOKEN, AGENT_TOKEN, INVALID_TOKEN } from './helpers'

describe('Auth middleware', () => {
  it('returns 401 when no Authorization header', async () => {
    const res = await request(app).post('/api/agents').send({ name: 'X', workspaceId: 'ws-1' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for invalid token', async () => {
    const res = await request(app)
      .post('/api/agents')
      .set(authHeader(INVALID_TOKEN))
      .send({ name: 'X', workspaceId: 'ws-1' })
    expect(res.status).toBe(401)
  })

  it('allows request with valid human token', async () => {
    const res = await request(app)
      .post('/api/agents')
      .set(authHeader(HUMAN_TOKEN))
      .send({ name: 'Test Agent', workspaceId: 'ws-1' })
    expect(res.status).toBe(201)
  })
})

describe('POST /api/auth/login', () => {
  it('returns 400 when idToken missing', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
  })

  it('returns user profile for valid token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: HUMAN_TOKEN })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('uid')
    expect(res.body).toHaveProperty('email')
  })

  it('returns 401 for invalid idToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ idToken: INVALID_TOKEN })
    expect(res.status).toBe(401)
  })
})

describe('requireAgentRole', () => {
  it('returns 403 when human token hits heartbeat POST', async () => {
    const res = await request(app)
      .post('/api/agents/agent-1/heartbeat')
      .set(authHeader(HUMAN_TOKEN))
      .send({})
    expect(res.status).toBe(403)
  })

  it('allows agent token on heartbeat POST', async () => {
    const res = await request(app)
      .post('/api/agents/agent-1/heartbeat')
      .set(authHeader(AGENT_TOKEN))
      .send({})
    expect(res.status).toBe(200)
  })
})
