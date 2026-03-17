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
  {
    name: 'add_songs_to_practice_list',
    description:
      'Add a curated list of songs to the user\'s Practice Lists tab, grouped under a named category. Use this when the user asks for song recommendations for a specific practice goal (e.g. "50 funk songs for strumming", "blues phrasing songs", "shuffle timing songs").',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Name of the practice category or goal, e.g. "Funk Strumming & Timing", "Blues Phrasing", "Shuffle Rhythm"',
        },
        songs: {
          type: 'array',
          description: 'List of songs to add',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Song title' },
              artist: { type: 'string', description: 'Artist name' },
              difficulty: {
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced'],
                description: 'Difficulty level',
              },
              skills: {
                type: 'array',
                items: { type: 'string' },
                description: 'Guitar skills/techniques this song develops, e.g. ["strumming", "timing", "rhythm"]',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Descriptive tags, e.g. ["16th notes", "syncopation", "groove"]',
              },
              notes: {
                type: 'string',
                description: 'Brief note on why this song is good for this practice area (1 sentence)',
              },
            },
            required: ['title', 'artist', 'difficulty', 'skills'],
          },
        },
      },
      required: ['category', 'songs'],
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
