import React, { useState } from 'react'
import ExerciseCard from './ExerciseCard.jsx'
import AddExerciseModal from './AddExerciseModal.jsx'
import SongSuggestions from './SongSuggestions.jsx'
import useStore from '../../store/index.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'

export default function SessionBuilder() {
  const {
    exerciseLibrary,
    currentSession,
    removeFromSession,
    updateSessionBpm,
    reorderSession,
    clearSession,
    setView,
    savedRoutines,
    saveRoutine,
    loadRoutine,
    deleteRoutine,
  } = useStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [routineName, setRoutineName] = useState('')
  const [showRoutines, setShowRoutines] = useState(false)

  // Group exercises by technique
  const grouped = exerciseLibrary.reduce((acc, ex) => {
    if (!acc[ex.technique]) acc[ex.technique] = []
    acc[ex.technique].push(ex)
    return acc
  }, {})

  const sessionExercises = currentSession
    .map((s) => ({ ...s, exercise: exerciseLibrary.find((e) => e.id === s.exerciseId) }))
    .filter((s) => s.exercise)

  const sessionTechniques = sessionExercises.map((s) => s.exercise.technique)

  const routineList = Object.values(savedRoutines).sort((a, b) => b.createdAt - a.createdAt)

  const handleSaveRoutine = () => {
    if (!routineName.trim()) return
    saveRoutine(routineName.trim())
    setRoutineName('')
  }

  return (
    <>
      {showAddModal && <AddExerciseModal onClose={() => setShowAddModal(false)} />}

      <div className="flex gap-6 h-full">
        {/* Left: Exercise Library */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Exercise Library</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{exerciseLibrary.length} exercises</span>
              <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm px-3 py-1.5">
                + New Exercise
              </button>
            </div>
          </div>

          {Object.entries(grouped).map(([technique, exercises]) => (
            <section key={technique}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${TECHNIQUE_COLORS[technique] || 'bg-gray-700 text-gray-300'}`}>
                  {technique}
                </span>
                <span className="text-xs text-gray-500">{exercises.length}</span>
              </div>
              <div className="space-y-3">
                {exercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Right: Session Panel */}
        <div className="w-80 shrink-0 space-y-4">

          {/* Saved Routines */}
          <div className="card">
            <button
              onClick={() => setShowRoutines((v) => !v)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-gray-100"
            >
              <span>Saved Routines {routineList.length > 0 && <span className="text-orange-400">({routineList.length})</span>}</span>
              <span className="text-gray-500">{showRoutines ? '▲' : '▼'}</span>
            </button>

            {showRoutines && (
              <div className="mt-3 space-y-2">
                {routineList.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No saved routines yet</p>
                ) : (
                  routineList.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-100 truncate">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.session.length} exercises</p>
                      </div>
                      <button
                        onClick={() => loadRoutine(r.id)}
                        className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteRoutine(r.id)}
                        className="text-xs text-red-500 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Current Session */}
          <div className="card sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-100">
                Current Session
                {currentSession.length > 0 && (
                  <span className="ml-2 text-sm text-orange-400">({currentSession.length})</span>
                )}
              </h2>
              {currentSession.length > 0 && (
                <button onClick={clearSession} className="btn-ghost text-xs text-red-400 hover:text-red-300">
                  Clear
                </button>
              )}
            </div>

            {currentSession.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-3xl mb-2">🎵</p>
                <p className="text-sm">Add exercises from the library to build your session</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {sessionExercises.map(({ exerciseId, sessionBpm, exercise }, index) => {
                    const techniqueColor = TECHNIQUE_COLORS[exercise.technique] || 'bg-gray-700 text-gray-300'
                    return (
                      <div key={exerciseId} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-100 truncate">{exercise.name}</p>
                            <span className={`badge ${techniqueColor} mt-1`}>{exercise.technique}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => index > 0 && reorderSession(index, index - 1)}
                              disabled={index === 0}
                              className="text-gray-500 hover:text-gray-300 disabled:opacity-30 text-xs px-1"
                            >▲</button>
                            <button
                              onClick={() => index < sessionExercises.length - 1 && reorderSession(index, index + 1)}
                              disabled={index === sessionExercises.length - 1}
                              className="text-gray-500 hover:text-gray-300 disabled:opacity-30 text-xs px-1"
                            >▼</button>
                            <button
                              onClick={() => removeFromSession(exerciseId)}
                              className="text-red-500 hover:text-red-300 text-xs px-1 ml-1"
                            >✕</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">BPM</label>
                          <input
                            type="number"
                            min={30}
                            max={300}
                            value={sessionBpm}
                            onChange={(e) => updateSessionBpm(exerciseId, Number(e.target.value))}
                            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 text-center"
                          />
                          <span className="text-xs text-gray-500">/ {exercise.targetBpm}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Save as Routine */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRoutine()}
                    placeholder="Routine name…"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleSaveRoutine}
                    disabled={!routineName.trim()}
                    className="btn-secondary text-sm px-3 py-1.5"
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setView('practice')}
              disabled={currentSession.length === 0}
              className="btn-primary w-full"
            >
              Start Practice →
            </button>
          </div>

          {/* Song suggestions — updates live as exercises are added */}
          <SongSuggestions techniques={sessionTechniques} />
        </div>
      </div>
    </>
  )
}
