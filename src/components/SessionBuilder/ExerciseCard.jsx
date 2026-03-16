import React, { useState } from 'react'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'
import useStore from '../../store/index.js'

export default function ExerciseCard({ exercise }) {
  const [expanded, setExpanded] = useState(false)
  const { currentSession, addToSession, exerciseHistory } = useStore()
  const inSession = currentSession.some((s) => s.exerciseId === exercise.id)
  const history = exerciseHistory[exercise.id]

  const techniqueColor = TECHNIQUE_COLORS[exercise.technique] || TECHNIQUE_COLORS.theory

  return (
    <div className={`card transition-all ${inSession ? 'border-orange-700' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-100 truncate">{exercise.name}</h3>
            <span className={`badge ${techniqueColor}`}>{exercise.technique}</span>
            {exercise.isCustom && (
              <span className="badge bg-orange-900 text-orange-300">custom</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">{exercise.description}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Start: <strong className="text-gray-300">{exercise.startBpm} BPM</strong></span>
            <span>Target: <strong className="text-orange-400">{exercise.targetBpm} BPM</strong></span>
            <span>{exercise.timeSignature}</span>
            {history && (
              <span className="text-teal-400">Last: {history.lastBpm} BPM</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="btn-ghost text-xs"
            aria-label="Toggle details"
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button
            onClick={() => addToSession(exercise)}
            disabled={inSession}
            className="btn-primary text-sm px-3 py-1.5"
          >
            {inSession ? 'Added' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-1">How to Play</h4>
            <p className="text-sm text-gray-300">{exercise.howToPlay}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-1">Tips</h4>
            <ul className="space-y-1">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-orange-500 shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
