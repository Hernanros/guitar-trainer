import React, { useState, useCallback, useEffect } from 'react'
import { useMetronome } from '../../hooks/useMetronome.js'
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer.js'
import PerformanceListener from './PerformanceListener.jsx'
import useStore from '../../store/index.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'

export default function Practice() {
  const {
    currentSession,
    exerciseLibrary,
    activeExerciseIndex,
    setActiveExerciseIndex,
    recordSession,
    setView,
    isReadyToLevelUp,
  } = useStore()

  const [bpm, setBpm] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [expanded, setExpanded] = useState(false)
  const [toast, setToast] = useState(null)

  const analyzer = useAudioAnalyzer()

  const sessionItem = currentSession[activeExerciseIndex]
  const exercise = sessionItem
    ? exerciseLibrary.find((e) => e.id === sessionItem.exerciseId)
    : null

  useEffect(() => {
    if (sessionItem) setBpm(sessionItem.sessionBpm)
    setIsPlaying(false)
    setCurrentBeat(-1)
    setExpanded(false)
  }, [activeExerciseIndex, sessionItem?.exerciseId])

  const handleBeat = useCallback((beatNumber) => {
    setCurrentBeat(beatNumber)
    // Forward beat timestamps to analyzer for timing analysis
    analyzer.recordBeat(Date.now())
  }, [analyzer.recordBeat])

  const { start, stop } = useMetronome({
    bpm: bpm || 60,
    beatsPerMeasure: 4,
    onBeat: handleBeat,
  })

  const toggleMetronome = () => {
    if (isPlaying) {
      stop()
      setIsPlaying(false)
      setCurrentBeat(-1)
    } else {
      start()
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    return () => { stop() }
  }, [stop, activeExerciseIndex])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleComplete = () => {
    stop()
    setIsPlaying(false)
    recordSession(exercise.id, bpm)

    const ready = isReadyToLevelUp(exercise.id)
    showToast(ready ? `Ready to level up! Try ${exercise.targetBpm} BPM` : `Saved: ${bpm} BPM`)

    if (activeExerciseIndex < currentSession.length - 1) {
      setTimeout(() => setActiveExerciseIndex(activeExerciseIndex + 1), 500)
    } else {
      setTimeout(() => { showToast('Session complete!'); setView('builder') }, 800)
    }
  }

  const handleSkip = () => {
    stop()
    setIsPlaying(false)
    if (activeExerciseIndex < currentSession.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1)
    } else {
      setView('builder')
    }
  }

  const adjustBpm = (delta) => setBpm((b) => Math.min(300, Math.max(30, (b || 60) + delta)))

  if (currentSession.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <p className="text-4xl mb-4">🎸</p>
        <p className="text-lg mb-4">No exercises in your session</p>
        <button onClick={() => setView('builder')} className="btn-primary">Go to Session Builder</button>
      </div>
    )
  }

  const techniqueColor = exercise ? TECHNIQUE_COLORS[exercise.technique] || 'bg-gray-700 text-gray-300' : ''
  const progressPct = exercise && bpm
    ? Math.min(100, Math.round(((bpm - exercise.startBpm) / (exercise.targetBpm - exercise.startBpm)) * 100))
    : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {currentSession.map((s, i) => {
          const ex = exerciseLibrary.find((e) => e.id === s.exerciseId)
          return (
            <button
              key={s.exerciseId}
              onClick={() => { stop(); setIsPlaying(false); setActiveExerciseIndex(i) }}
              title={ex?.name}
              className={`w-3 h-3 rounded-full transition-all ${
                i === activeExerciseIndex ? 'bg-orange-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          )
        })}
        <span className="text-xs text-gray-500 ml-2">{activeExerciseIndex + 1} / {currentSession.length}</span>
      </div>

      {exercise && (
        <>
          {/* Exercise header */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-100">{exercise.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${techniqueColor}`}>{exercise.technique}</span>
                  <span className="text-xs text-gray-400">{exercise.timeSignature}</span>
                </div>
              </div>
              <button onClick={() => setExpanded((e) => !e)} className="btn-ghost text-sm">
                {expanded ? 'Hide details' : 'Show details'}
              </button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Start: {exercise.startBpm} BPM</span>
                <span>Target: {exercise.targetBpm} BPM</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all"
                  style={{ width: `${Math.max(0, progressPct)}%` }}
                />
              </div>
            </div>

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

          {/* Metronome */}
          <div className="card space-y-5">
            <h3 className="section-title">Metronome</h3>

            {/* Beat grid */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((beat) => (
                <div
                  key={beat}
                  className={`
                    w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl transition-all duration-75
                    ${currentBeat === beat
                      ? beat === 0
                        ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/40'
                        : 'bg-orange-700 text-white scale-105'
                      : 'bg-gray-800 text-gray-500'
                    }
                  `}
                >
                  {beat + 1}
                </div>
              ))}
            </div>

            {/* BPM controls — wraps to two rows on mobile */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button onClick={() => adjustBpm(-5)} className="btn-secondary w-10 h-10 !px-0 !py-0 flex items-center justify-center text-sm">−5</button>
                <button onClick={() => adjustBpm(-1)} className="btn-secondary w-10 h-10 !px-0 !py-0 flex items-center justify-center text-lg">−</button>
              </div>
              <input
                type="number"
                min={30} max={300}
                value={bpm || ''}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-2xl font-bold text-center text-orange-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              />
              <div className="flex items-center gap-2">
                <button onClick={() => adjustBpm(1)} className="btn-secondary w-10 h-10 !px-0 !py-0 flex items-center justify-center text-lg">+</button>
                <button onClick={() => adjustBpm(5)} className="btn-secondary w-10 h-10 !px-0 !py-0 flex items-center justify-center text-sm">+5</button>
              </div>
            </div>

            <input
              type="range" min={30} max={300} value={bpm || 60}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />

            <button
              onClick={toggleMetronome}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-150 ${
                isPlaying
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
              }`}
            >
              {isPlaying ? '⏹ Stop' : '▶ Start'}
            </button>
          </div>

          {/* Performance Listener */}
          <PerformanceListener
            analyzer={analyzer}
            exercise={exercise}
            isMetronomePlaying={isPlaying}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleSkip} className="btn-secondary flex-1">Skip</button>
            <button onClick={handleComplete} className="btn-primary flex-1">Complete at {bpm} BPM</button>
          </div>
        </>
      )}
    </div>
  )
}
