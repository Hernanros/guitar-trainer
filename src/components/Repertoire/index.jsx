import React, { useState } from 'react'
import useStore from '../../store/index.js'
import { SONG_LIBRARY } from '../../data/songs.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'

const STATUS_CONFIG = {
  want:      { label: 'Want to learn', color: 'bg-gray-700 text-gray-300',   next: 'learning' },
  learning:  { label: 'Learning',      color: 'bg-yellow-900 text-yellow-300', next: 'can play' },
  'can play':{ label: 'Can play',      color: 'bg-green-900 text-green-300',  next: 'want' },
}

const REVIEW_DAYS = { learning: 7, 'can play': 21 }

function daysSince(ts) {
  if (!ts) return null
  return Math.floor((Date.now() - ts) / 86400000)
}

function isDue(song) {
  const threshold = REVIEW_DAYS[song.status]
  if (!threshold) return false
  const days = daysSince(song.lastPracticedAt)
  if (days === null) return song.practiceCount === 0
  return days >= threshold
}

function AddSongModal({ onClose, prefill }) {
  const { addToSongLog } = useStore()
  const [title, setTitle] = useState(prefill?.title || '')
  const [artist, setArtist] = useState(prefill?.artist || '')
  const [status, setStatus] = useState('want')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) { setError('Song title is required.'); return }
    addToSongLog({ title: title.trim(), artist: artist.trim(), status, notes: notes.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-100">Add Song to Repertoire</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Song title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              placeholder="e.g. Comfortably Numb – Solo"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Artist</label>
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Pink Floyd"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Status</label>
            <div className="flex gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium border transition-colors ${
                    status === key
                      ? 'border-orange-500 bg-orange-900/40 text-orange-300'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. need to work on the bends in bar 12"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">Add Song</button>
        </div>
      </div>
    </div>
  )
}

function SongCard({ song }) {
  const { updateSongLog, removeSongLog, markSongPracticed, addToSession, exerciseLibrary } = useStore()
  const [showNotes, setShowNotes] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [noteDraft, setNoteDraft] = useState(song.notes)

  const cfg = STATUS_CONFIG[song.status]
  const days = daysSince(song.lastPracticedAt)
  const due = isDue(song)

  const cycleStatus = () => updateSongLog(song.id, { status: cfg.next })

  const saveNotes = () => {
    updateSongLog(song.id, { notes: noteDraft })
    setEditingNotes(false)
  }

  // Find related exercises from library
  const relatedExercises = song.techniques?.length
    ? exerciseLibrary.filter((e) => song.techniques.includes(e.technique)).slice(0, 3)
    : []

  return (
    <div className={`bg-gray-800 rounded-lg p-3 space-y-2 ${due ? 'ring-1 ring-yellow-700' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-100">{song.title}</span>
            {due && (
              <span className="text-xs bg-yellow-900 text-yellow-300 px-1.5 py-0.5 rounded font-medium">
                ⏰ Due for review
              </span>
            )}
          </div>
          {song.artist && <p className="text-xs text-gray-500 mt-0.5">{song.artist}</p>}
        </div>
        <button
          onClick={() => removeSongLog(song.id)}
          className="shrink-0 text-gray-600 hover:text-red-400 text-xs transition-colors"
        >✕</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={cycleStatus}
          className={`badge text-xs ${cfg.color} cursor-pointer hover:opacity-80 transition-opacity`}
          title="Click to advance status"
        >
          {cfg.label} →
        </button>

        <span className="text-xs text-gray-600">
          {song.practiceCount === 0
            ? 'Never practiced'
            : days === 0
            ? 'Practiced today'
            : days === 1
            ? 'Practiced yesterday'
            : `${days}d ago · ${song.practiceCount}× total`}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => markSongPracticed(song.id)}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors"
        >
          ✓ Practiced today
        </button>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist + ' guitar lesson')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded px-2 py-1 transition-colors"
        >
          ▶ Lesson
        </a>
        <button
          onClick={() => setShowNotes((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {song.notes ? '📝 Notes' : '+ Note'}
        </button>
      </div>

      {showNotes && (
        <div className="pt-1">
          {editingNotes ? (
            <div className="space-y-1">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                placeholder="Notes, problem spots, what to work on…"
              />
              <div className="flex gap-2">
                <button onClick={saveNotes} className="text-xs text-orange-400 hover:text-orange-300">Save</button>
                <button onClick={() => { setEditingNotes(false); setNoteDraft(song.notes) }} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setEditingNotes(true)}
              className="text-xs text-gray-400 leading-relaxed cursor-pointer hover:text-gray-300 italic"
            >
              {song.notes || 'Click to add a note…'}
            </p>
          )}
        </div>
      )}

      {relatedExercises.length > 0 && (
        <div className="pt-1 border-t border-gray-700 space-y-1">
          <p className="text-xs text-gray-500">Related exercises:</p>
          <div className="flex flex-wrap gap-1">
            {relatedExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => addToSession(ex)}
                className={`badge text-xs ${TECHNIQUE_COLORS[ex.technique] || 'bg-gray-700 text-gray-300'} cursor-pointer hover:opacity-80`}
                title={`Add "${ex.name}" to session`}
              >
                + {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NextSuggestions() {
  const { songLog, exerciseHistory, exerciseLibrary, spotify, addToSongLog } = useStore()
  const loggedTitles = new Set(songLog.map((s) => s.title.toLowerCase()))

  // Which techniques has the user been actively practicing?
  const practicedTechniques = Object.entries(exerciseHistory)
    .filter(([, h]) => h.totalSessions > 0)
    .map(([id]) => exerciseLibrary.find((e) => e.id === id)?.technique)
    .filter(Boolean)
  const techSet = new Set(practicedTechniques)

  // Score songs from the curated library not already in log
  const genreSet = new Set(spotify.connected ? (spotify.topGenres || []) : [])
  const suggestions = SONG_LIBRARY
    .filter((s) => !loggedTitles.has(s.title.toLowerCase()))
    .map((s) => {
      const techScore = s.techniques.filter((t) => techSet.has(t)).length
      const genreBoost = genreSet.has(s.genre) ? 1.5 : 0
      return { ...s, score: techScore + genreBoost }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Unlogged Spotify top tracks
  const spotifyUnlogged = (spotify.topTracks || [])
    .filter((t) => !loggedTitles.has(t.title.toLowerCase()))
    .slice(0, 4)

  if (suggestions.length === 0 && spotifyUnlogged.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">What to learn next</h3>

      {spotifyUnlogged.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-green-400 font-medium uppercase tracking-wide">♫ From your Spotify</p>
          {spotifyUnlogged.map((track, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-100 truncate">{track.title}</p>
                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
              </div>
              <button
                onClick={() => addToSongLog({ title: track.title, artist: track.artist, status: 'want' })}
                className="shrink-0 text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded px-2 py-1 transition-colors"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Based on your practice</p>
          {suggestions.map((song) => (
            <div key={song.id} className="flex items-center justify-between gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-100 truncate">{song.title}</p>
                <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {song.techniques.filter((t) => techSet.has(t)).map((t) => (
                    <span key={t} className={`badge text-xs ${TECHNIQUE_COLORS[t] || 'bg-gray-700 text-gray-300'}`}>{t}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => addToSongLog({ title: song.title, artist: song.artist, status: 'want', techniques: song.techniques })}
                className="shrink-0 text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded px-2 py-1 transition-colors"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Repertoire() {
  const { songLog, spotify } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [modalPrefill, setModalPrefill] = useState(null)
  const [filter, setFilter] = useState('all')

  const openAdd = (prefill = null) => { setModalPrefill(prefill); setShowModal(true) }

  const dueCount = songLog.filter(isDue).length

  const filtered = filter === 'all'
    ? songLog
    : songLog.filter((s) => filter === 'due' ? isDue(s) : s.status === filter)

  // Sort: due first, then by last practiced (oldest first)
  const sorted = [...filtered].sort((a, b) => {
    if (isDue(a) && !isDue(b)) return -1
    if (!isDue(a) && isDue(b)) return 1
    return (a.lastPracticedAt || 0) - (b.lastPracticedAt || 0)
  })

  return (
    <>
      {showModal && <AddSongModal onClose={() => setShowModal(false)} prefill={modalPrefill} />}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Repertoire</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {songLog.length} songs · {songLog.filter((s) => s.status === 'can play').length} can play
              {dueCount > 0 && <span className="text-yellow-400 font-medium"> · {dueCount} due for review</span>}
            </p>
          </div>
          <button onClick={() => openAdd()} className="btn-primary text-sm px-3 py-1.5">
            + Add Song
          </button>
        </div>

        {/* Due for review callout */}
        {dueCount > 0 && (
          <div
            className="bg-yellow-950 border border-yellow-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-yellow-900/40 transition-colors"
            onClick={() => setFilter(filter === 'due' ? 'all' : 'due')}
          >
            <div>
              <p className="text-sm font-semibold text-yellow-300">⏰ {dueCount} song{dueCount > 1 ? 's' : ''} due for review</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                {dueCount === 1 ? "It's" : "They're"} getting rusty — tap to practice them
              </p>
            </div>
            <span className="text-yellow-600 text-sm">{filter === 'due' ? '▲' : '▼'}</span>
          </div>
        )}

        {/* Filter tabs */}
        {songLog.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {[
              { id: 'all', label: `All (${songLog.length})` },
              { id: 'want', label: `Want (${songLog.filter((s) => s.status === 'want').length})` },
              { id: 'learning', label: `Learning (${songLog.filter((s) => s.status === 'learning').length})` },
              { id: 'can play', label: `Can play (${songLog.filter((s) => s.status === 'can play').length})` },
              ...(dueCount > 0 ? [{ id: 'due', label: `⏰ Due (${dueCount})` }] : []),
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Song log */}
        {songLog.length === 0 ? (
          <div className="card text-center py-12 space-y-3">
            <p className="text-4xl">🎸</p>
            <p className="text-gray-300 font-medium">Your repertoire is empty</p>
            <p className="text-sm text-gray-500">Add songs you want to learn, are currently learning, or can already play.</p>
            <button onClick={() => openAdd()} className="btn-primary mx-auto">+ Add your first song</button>
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No songs in this filter</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((song) => <SongCard key={song.id} song={song} />)}
          </div>
        )}

        {/* What to learn next */}
        <div className="card">
          <NextSuggestions />
          {songLog.length === 0 && (
            <p className="text-xs text-gray-500 text-center">Start adding songs to get personalized suggestions</p>
          )}
        </div>
      </div>
    </>
  )
}
