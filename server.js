import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const tools = [
  {
    name: 'add_exercise_to_library',
    description:
      'Add a new custom exercise to the user\'s exercise library. Use this when the user asks you to create or add a new exercise.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Short name for the exercise (e.g. "Chromatic Spider Walk")',
        },
        technique: {
          type: 'string',
          description:
            'Technique category. One of: scales, arpeggios, chords, legato, picking, fingerpicking, rhythm, theory, licks, slide, phrasing',
        },
        targetBpm: {
          type: 'number',
          description: 'The target BPM for mastery of this exercise',
        },
        startBpm: {
          type: 'number',
          description: 'Recommended starting BPM for beginners',
        },
        timeSignature: {
          type: 'string',
          description: 'Time signature, e.g. "4/4" or "3/4"',
        },
        description: {
          type: 'string',
          description: 'Brief description of the exercise',
        },
        howToPlay: {
          type: 'string',
          description: 'Step-by-step instructions on how to perform the exercise',
        },
        tips: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of practice tips for this exercise',
        },
      },
      required: ['name', 'technique', 'targetBpm', 'startBpm', 'timeSignature', 'description', 'howToPlay', 'tips'],
    },
  },
]

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: system || '',
      messages,
      tools,
    })

    res.json(response)
  } catch (err) {
    console.error('Anthropic API error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Guitar Trainer server running on http://localhost:${port}`)
})
