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

      // Spotify integration
      spotify: {
        connected: false,
        clientId: '',
        displayName: null,
        accessToken: null,
        expiresAt: null,
        topGenres: [],    // our genre tags: ['metal', 'rock', ...]
        topArtists: [],   // display names of top 5 artists
        topTracks: [],    // [{title, artist}] from /me/top/tracks
      },

      setSpotifyClientId: (clientId) =>
        set((state) => ({ spotify: { ...state.spotify, clientId } })),

      setSpotifyConnected: ({ accessToken, expiresAt, displayName, topGenres, topArtists, topTracks }) =>
        set((state) => ({
          spotify: {
            ...state.spotify,
            connected: true,
            accessToken,
            expiresAt,
            displayName,
            topGenres,
            topArtists,
            topTracks: topTracks ?? [],
          },
        })),

      disconnectSpotify: () =>
        set((state) => ({
          spotify: {
            ...state.spotify,
            connected: false,
            accessToken: null,
            expiresAt: null,
            displayName: null,
            topGenres: [],
            topArtists: [],
            topTracks: [],
          },
        })),

      // Practice song lists (curated/AI-suggested, categorized by goal)
      practiceSongList: [],

      addPracticeSong: (song) => {
        const entry = {
          id: `psl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: song.title || 'Untitled',
          artist: song.artist || '',
          category: song.category || 'General',
          tags: song.tags || [],
          skills: song.skills || [],
          difficulty: song.difficulty || 'intermediate',
          notes: song.notes || '',
          addedAt: Date.now(),
          addedBy: song.addedBy || 'user',
        }
        set((state) => ({ practiceSongList: [...state.practiceSongList, entry] }))
        return entry
      },

      addPracticeSongs: ({ category, songs }) => {
        const entries = songs.map((song) => ({
          id: `psl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: song.title || 'Untitled',
          artist: song.artist || '',
          category: category || 'General',
          tags: song.tags || [],
          skills: song.skills || [],
          difficulty: song.difficulty || 'intermediate',
          notes: song.notes || '',
          addedAt: Date.now(),
          addedBy: 'coach',
        }))
        set((state) => ({ practiceSongList: [...state.practiceSongList, ...entries] }))
        return entries
      },

      updatePracticeSong: (id, changes) =>
        set((state) => ({
          practiceSongList: state.practiceSongList.map((s) => (s.id === id ? { ...s, ...changes } : s)),
        })),

      removePracticeSong: (id) =>
        set((state) => ({ practiceSongList: state.practiceSongList.filter((s) => s.id !== id) })),

      moveSongToRepertoire: (id) => {
        const song = get().practiceSongList.find((s) => s.id === id)
        if (!song) return
        get().addToSongLog({ title: song.title, artist: song.artist, status: 'want', techniques: song.skills, notes: song.notes })
        get().removePracticeSong(id)
      },

      // Tab library
      tabLibrary: [],

      addTab: (tab) => {
        const entry = {
          id: `tab-${Date.now()}`,
          title: tab.title || 'Untitled',
          artist: tab.artist || '',
          content: tab.content,
          capo: tab.capo ?? 0,
          tuning: tab.tuning || 'Standard',
          linkedSongId: tab.linkedSongId || null,
          addedAt: Date.now(),
        }
        set((state) => ({ tabLibrary: [...state.tabLibrary, entry] }))
        return entry
      },

      updateTab: (id, changes) =>
        set((state) => ({
          tabLibrary: state.tabLibrary.map((t) => (t.id === id ? { ...t, ...changes } : t)),
        })),

      removeTab: (id) =>
        set((state) => ({ tabLibrary: state.tabLibrary.filter((t) => t.id !== id) })),

      // Song repertoire log
      songLog: [],

      addToSongLog: ({ title, artist, status = 'want', techniques = [], notes = '' }) => {
        const entry = {
          id: `song-log-${Date.now()}`,
          title,
          artist,
          status,
          techniques,
          notes,
          addedAt: Date.now(),
          lastPracticedAt: null,
          practiceCount: 0,
        }
        set((state) => ({ songLog: [...state.songLog, entry] }))
        return entry
      },

      updateSongLog: (id, changes) =>
        set((state) => ({
          songLog: state.songLog.map((s) => (s.id === id ? { ...s, ...changes } : s)),
        })),

      removeSongLog: (id) =>
        set((state) => ({ songLog: state.songLog.filter((s) => s.id !== id) })),

      markSongPracticed: (id) =>
        set((state) => ({
          songLog: state.songLog.map((s) =>
            s.id === id
              ? { ...s, lastPracticedAt: Date.now(), practiceCount: s.practiceCount + 1 }
              : s
          ),
        })),

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
        songLog: state.songLog,
        practiceSongList: state.practiceSongList,
        tabLibrary: state.tabLibrary,
        spotify: {
          connected: state.spotify.connected,
          clientId: state.spotify.clientId,
          topGenres: state.spotify.topGenres,
          topArtists: state.spotify.topArtists,
          topTracks: state.spotify.topTracks,
          displayName: state.spotify.displayName,
        },
      }),
    }
  )
)

export default useStore
