import React, { useState, useRef, useEffect } from 'react'
import useStore from '../../store/index.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'

const SUGGESTED_PROMPTS = [
  'Create a fingerpicking exercise in 6/8 for intermediate players',
  'Make a funk rhythm exercise inspired by James Brown',
  'Write a legato exercise targeting the pinky finger',
  'Create a blues phrasing exercise with call and response',
  'What should I practice to improve my speed?',
  'How do I fix tension in my picking hand?',
]

function buildSystemPrompt(exerciseLibrary, currentSession, exerciseHistory) {
  const libraryList = exerciseLibrary
    .map((e) => `- ${e.name} (${e.technique}, ${e.startBpm}→${e.targetBpm} BPM)`)
    .join('\n')

  const historyLines = Object.entries(exerciseHistory)
    .map(([id, h]) => {
      const ex = exerciseLibrary.find((e) => e.id === id)
      return ex ? `- ${ex.name}: last ${h.lastBpm} BPM, ${h.totalSessions} sessions` : null
    })
    .filter(Boolean)
    .join('\n')

  return `You are an expert guitar coach and curriculum designer.

Student's exercise library (${exerciseLibrary.length} exercises):
${libraryList || 'Empty'}

Practice history:
${historyLines || 'No history yet.'}

## Tool use rules — follow these exactly:
- When the student asks you to CREATE, WRITE, ADD, or MAKE an exercise, call add_exercise_to_library immediately. Do NOT describe the exercise in text first — call the tool.
- You may call the tool multiple times in one turn if the student asks for several exercises.
- After calling the tool, write a short confirmation message (1-2 sentences max).
- For all other questions, respond normally without calling the tool.

Valid technique values: scales, arpeggios, chords, legato, picking, fingerpicking, rhythm, theory, licks, slide, phrasing`
}

function renderText(text) {
  if (!text || typeof text !== 'string') return null
  return text.split('\n').map((line, i, arr) => {
    const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

function ExerciseAddedCard({ exercise, onAddToSession }) {
  const techniqueColor = TECHNIQUE_COLORS[exercise.technique] || 'bg-gray-700 text-gray-300'
  return (
    <div className="border border-green-700 bg-green-950/40 rounded-xl p-4 space-y-2 w-full max-w-sm">
      <div className="flex items-center gap-2 text-green-400 text-xs font-semibold uppercase tracking-wide">
        <span>✓</span>
        <span>Added to library</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-100">{exercise.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`badge ${techniqueColor}`}>{exercise.technique}</span>
          <span className="text-xs text-gray-500">{exercise.startBpm} → {exercise.targetBpm} BPM · {exercise.timeSignature}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{exercise.description}</p>
      <button
        onClick={() => onAddToSession(exercise)}
        className="text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded px-2 py-1 transition-colors"
      >
        + Add to session
      </button>
    </div>
  )
}

export default function Coach() {
  const {
    exerciseLibrary,
    currentSession,
    exerciseHistory,
    addExerciseToLibrary,
    addToSession,
    coachDisplayMessages,
    coachApiMessages,
    appendCoachMessage,
    setCoachApiMessages,
    clearCoachMessages,
  } = useStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [coachDisplayMessages, loading])

  const sendMessage = async (content) => {
    if (!content.trim() || loading) return

    const userMsg = { role: 'user', content }
    appendCoachMessage(userMsg)
    const latestApiMessages = [...useStore.getState().coachApiMessages, userMsg]
    setCoachApiMessages(latestApiMessages)
    setInput('')
    setLoading(true)

    try {
      let apiMessages = latestApiMessages
      const MAX_ITERATIONS = 8

      for (let i = 0; i < MAX_ITERATIONS; i++) {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            system: buildSystemPrompt(
              useStore.getState().exerciseLibrary,
              useStore.getState().currentSession,
              useStore.getState().exerciseHistory,
            ),
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
          throw new Error(err.error || `Server error ${res.status}`)
        }

        const data = await res.json()

        if (data.stop_reason === 'tool_use') {
          const toolUseBlocks = data.content.filter((b) => b.type === 'tool_use')
          const toolResults = []

          for (const toolBlock of toolUseBlocks) {
            if (toolBlock.name === 'add_exercise_to_library') {
              const newExercise = addExerciseToLibrary(toolBlock.input)
              // Show the exercise card inline in the chat immediately
              appendCoachMessage({ role: 'exercise_added', exercise: newExercise })
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolBlock.id,
                content: `Exercise "${newExercise.name}" (id: ${newExercise.id}) added successfully.`,
              })
            } else {
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolBlock.id,
                content: 'Tool not available.',
                is_error: true,
              })
            }
          }

          apiMessages = [
            ...apiMessages,
            { role: 'assistant', content: data.content },
            { role: 'user', content: toolResults },
          ]

        } else {
          const textBlock = data.content?.find((b) => b.type === 'text')
          const responseText = textBlock?.text?.trim()
          if (responseText) {
            const assistantMsg = { role: 'assistant', content: responseText }
            appendCoachMessage(assistantMsg)
            apiMessages = [...apiMessages, assistantMsg]
          }
          setCoachApiMessages(apiMessages)
          break
        }

        if (i === MAX_ITERATIONS - 1) {
          setCoachApiMessages(apiMessages)
        }
      }
    } catch (err) {
      console.error('[Coach] Error:', err)
      appendCoachMessage({ role: 'assistant', content: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {coachDisplayMessages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🤖</p>
              <h2 className="text-xl font-bold text-gray-100 mb-1">AI Guitar Coach</h2>
              <p className="text-gray-400 text-sm">Ask a question or describe an exercise — I'll write it straight into your library.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="card text-left text-sm text-gray-300 hover:border-orange-700 hover:text-gray-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-1">
              <button onClick={clearCoachMessages} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Clear chat
              </button>
            </div>

            {coachDisplayMessages.map((msg, i) => {
              if (msg.role === 'exercise_added') {
                return (
                  <div key={i} className="flex justify-start">
                    <ExerciseAddedCard
                      exercise={msg.exercise}
                      onAddToSession={(ex) => addToSession(ex)}
                    />
                  </div>
                )
              }
              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-orange-600 text-white rounded-tr-sm'
                        : 'bg-gray-800 text-gray-100 rounded-tl-sm'
                      }
                    `}
                  >
                    {msg.role === 'assistant' ? renderText(msg.content) : msg.content}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
              <span className="ml-1">Writing exercise…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Describe an exercise or ask anything…"
          disabled={loading}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50 transition-colors"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="btn-primary px-5"
        >
          Send
        </button>
      </div>
    </div>
  )
}
