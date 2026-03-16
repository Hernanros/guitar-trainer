import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_EXERCISES } from '../data/exercises.js'

const useStore = create(
  persist(
    (set, get) => ({
      // Navigation
      view: 'builder',
      setView: (view) => set({ view }),

      // Exercise library
      exerciseLibrary: DEFAULT_EXERCISES,

      addExerciseToLibrary: (exercise) => {
        const newExercise = {
          ...exercise,
          id: `custom-${Date.now()}`,
          isCustom: true,
        }
        set((state) => ({
          exerciseLibrary: [...state.exerciseLibrary, newExercise],
        }))
        return newExercise
      },

      removeExerciseFromLibrary: (id) => {
        set((state) => ({
          exerciseLibrary: state.exerciseLibrary.filter((e) => e.id !== id),
          currentSession: state.currentSession.filter((e) => e.exerciseId !== id),
        }))
      },

      // Current session
      currentSession: [],

      addToSession: (exercise) => {
        const { currentSession } = get()
        const already = currentSession.find((s) => s.exerciseId === exercise.id)
        if (already) return
        set((state) => ({
          currentSession: [
            ...state.currentSession,
            {
              exerciseId: exercise.id,
              sessionBpm: exercise.startBpm,
            },
          ],
        }))
      },

      removeFromSession: (exerciseId) => {
        set((state) => ({
          currentSession: state.currentSession.filter((s) => s.exerciseId !== exerciseId),
        }))
      },

      updateSessionBpm: (exerciseId, bpm) => {
        set((state) => ({
          currentSession: state.currentSession.map((s) =>
            s.exerciseId === exerciseId ? { ...s, sessionBpm: bpm } : s
          ),
        }))
      },

      reorderSession: (fromIndex, toIndex) => {
        set((state) => {
          const session = [...state.currentSession]
          const [moved] = session.splice(fromIndex, 1)
          session.splice(toIndex, 0, moved)
          return { currentSession: session }
        })
      },

      clearSession: () => set({ currentSession: [], activeExerciseIndex: 0 }),

      // Practice state
      activeExerciseIndex: 0,
      setActiveExerciseIndex: (index) => set({ activeExerciseIndex: index }),

      // Saved routines
      savedRoutines: {},

      saveRoutine: (name) => {
        const { currentSession } = get()
        if (!currentSession.length) return
        const id = `routine-${Date.now()}`
        set((state) => ({
          savedRoutines: {
            ...state.savedRoutines,
            [id]: { id, name, session: [...currentSession], createdAt: Date.now() },
          },
        }))
      },

      loadRoutine: (id) => {
        const routine = get().savedRoutines[id]
        if (routine) set({ currentSession: [...routine.session], activeExerciseIndex: 0 })
      },

      deleteRoutine: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.savedRoutines
          return { savedRoutines: rest }
        })
      },

      // Coach chat — kept in store so it survives tab switches
      // displayMessages: what the user sees [{role, content: string}]
      // apiMessages: full Anthropic history including tool_use / tool_result turns
      coachDisplayMessages: [],
      coachApiMessages: [],
      appendCoachMessage: (msg) =>
        set((state) => ({ coachDisplayMessages: [...state.coachDisplayMessages, msg] })),
      setCoachApiMessages: (msgs) => set({ coachApiMessages: msgs }),
      clearCoachMessages: () => set({ coachDisplayMessages: [], coachApiMessages: [] }),

      // Exercise history
      exerciseHistory: {},

      recordSession: (exerciseId, bpm) => {
        set((state) => {
          const prev = state.exerciseHistory[exerciseId] || {
            sessions: [],
            lastBpm: bpm,
            totalSessions: 0,
          }
          const sessions = [...prev.sessions, { bpm, date: Date.now() }].slice(-10)
          return {
            exerciseHistory: {
              ...state.exerciseHistory,
              [exerciseId]: {
                sessions,
                lastBpm: bpm,
                totalSessions: prev.totalSessions + 1,
              },
            },
          }
        })
      },

      getExerciseHistory: (exerciseId) => {
        return get().exerciseHistory[exerciseId] || null
      },

      isReadyToLevelUp: (exerciseId) => {
        const exercise = get().exerciseLibrary.find((e) => e.id === exerciseId)
        if (!exercise) return false
        const history = get().exerciseHistory[exerciseId]
        if (!history || history.sessions.length < 3) return false
        const last3 = history.sessions.slice(-3)
        return last3.every((s) => s.bpm >= exercise.targetBpm * 0.9)
      },
    }),
    {
      name: 'guitar-trainer-storage',
      partialize: (state) => ({
        exerciseLibrary: state.exerciseLibrary,
        currentSession: state.currentSession,
        exerciseHistory: state.exerciseHistory,
        savedRoutines: state.savedRoutines,
      }),
    }
  )
)

export default useStore
