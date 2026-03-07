import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'

const router = Router()

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function extractInstructions(hcl: string): string {
  const match = hcl.match(/instructions\s*=\s*"([^"]*)"/)
  return match ? match[1] : hcl
}

router.post('/chat', authMiddleware, async (req, res) => {
  const { messages, agentfileContent } = req.body as {
    messages: ChatMessage[]
    agentfileContent: string
  }

  if (!messages || !agentfileContent) {
    res.status(400).json({ message: 'messages and agentfileContent required' })
    return
  }

  const systemPrompt = extractInstructions(agentfileContent)

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    res.status(503).json({ message: 'LLM not configured. Set OPENAI_API_KEY.' })
    return
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json() as { error?: { message?: string } }
      res.status(502).json({ message: err.error?.message ?? 'LLM error' })
      return
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>
    }
    res.json({ content: data.choices[0]?.message?.content ?? '' })
  } catch (e) {
    res.status(502).json({ message: (e as Error).message })
  }
})

export default router
