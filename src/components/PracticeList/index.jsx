import React, { useState, useMemo } from 'react'
import useStore from '../../store/index.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'

const DIFFICULTY_COLORS = {
  beginner:     'bg-green-900 text-green-300 border-green-800',
  intermediate: 'bg-yellow-900 text-yellow-300 border-yellow-800',
  advanced:     'bg-red-900 text-red-300 border-red-800',
}

// ── Song Edit Modal ────────────────────────────────────────────────────────────

function SongModal({ song, onClose, onSave }) {
  const TECHNIQUES = Object.keys(TECHNIQUE_COLORS)
  const [title, setTitle]         = useState(song?.title || '')
  const [artist, setArtist]       = useState(song?.artist || '')
  const [category, setCategory]   = useState(song?.category || '')
  const [difficulty, setDifficulty] = useState(song?.difficulty || 'intermediate')
  const [skills, setSkills]       = useState((song?.skills || []).join(', '))
  const [tags, setTags]           = useState((song?.tags || []).join(', '))
  const [notes, setNotes]         = useState(song?.notes || '')
  const [error, setError]         = useState('')

  const handleSave = () => {
    if (!title.trim()) { setError('Title is required.'); return }
    onSave({
      title: title.trim(),
      artist: artist.trim(),
      category: category.trim() || 'General',
      difficulty,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: notes.trim(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-100">{song ? 'Edit Song' : 'Add Song'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              className="input"
              placeholder="e.g. Superstition"
            />
          </div>

          <div>
            <label className="label">Artist</label>
            <input value={artist} onChange={(e) => setArtist(e.target.value)} className="input" placeholder="e.g. Stevie Wonder" />
          </div>

          <div>
            <label className="label">Category / List</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
              placeholder="e.g. Funk Strumming & Timing"
            />
          </div>

          <div>
            <label className="label">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="label">Skills (comma-separated)</label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="input"
              placeholder="e.g. rhythm, strumming, timing"
            />
            <p className="text-xs text-gray-500 mt-1">These map to your exercise techniques</p>
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="e.g. 16th notes, syncopation, groove"
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Why is this song good for this practice area?"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">{song ? 'Save Changes' : 'Add Song'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Song Card ─────────────────────────────────────────────────────────────────

function SongCard({ song, onEdit, onDelete, onMoveToRepertoire }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="bg-gray-850 border border-gray-800 rounded-xl p-4 space-y-2.5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-100 truncate">{song.title}</p>
          {song.artist && <p className="text-xs text-gray-400 mt-0.5">{song.artist}</p>}
        </div>
        <span className={`badge border ${DIFFICULTY_COLORS[song.difficulty] || DIFFICULTY_COLORS.intermediate} shrink-0`}>
          {song.difficulty}
        </span>
      </div>

      {song.notes && (
        <p className="text-xs text-gray-400 leading-relaxed bg-gray-800/60 rounded-lg px-3 py-2">{song.notes}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {song.skills?.map((s) => (
          <span key={s} className={`badge ${TECHNIQUE_COLORS[s] || 'bg-gray-700 text-gray-300'} text-xs`}>{s}</span>
        ))}
        {song.tags?.map((t) => (
          <span key={t} className="badge bg-gray-800 text-gray-400 border border-gray-700 text-xs">{t}</span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onMoveToRepertoire}
          className="text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded-lg px-2.5 py-1.5 transition-colors flex-1 text-center"
        >
          → Repertoire
        </button>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + (song.artist || '') + ' guitar lesson')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          ▶ Lesson
        </a>
        <button
          onClick={onEdit}
          className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          Edit
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300 font-semibold px-1.5 py-1">Yes</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:text-gray-300 px-1.5 py-1">No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="text-xs text-red-700 hover:text-red-400 transition-colors px-1 py-1">✕</button>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PracticeList() {
  const {
    practiceSongList,
    addPracticeSong,
    updatePracticeSong,
    removePracticeSong,
    moveSongToRepertoire,
    setView,
  } = useStore()

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]                 = useState('')
  const [showAddModal, setShowAddModal]     = useState(false)
  const [editingSong, setEditingSong]       = useState(null)

  // Derive categories from current songs
  const categories = useMemo(() => {
    const cats = [...new Set(practiceSongList.map((s) => s.category).filter(Boolean))]
    return cats.sort()
  }, [practiceSongList])

  const filtered = useMemo(() => {
    let songs = practiceSongList
    if (activeCategory !== 'all') songs = songs.filter((s) => s.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      songs = songs.filter(
        (s) =>
          (s.title || '').toLowerCase().includes(q) ||
          (s.artist || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q) ||
          (s.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (s.skills || []).some((sk) => sk.toLowerCase().includes(q))
      )
    }
    return songs
  }, [practiceSongList, activeCategory, search])

  // Group filtered songs by category for display
  const grouped = useMemo(() => {
    if (activeCategory !== 'all') {
      return { [activeCategory]: filtered }
    }
    return filtered.reduce((acc, song) => {
      const cat = song.category || 'General'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(song)
      return acc
    }, {})
  }, [filtered, activeCategory])

  const handleAdd = (data) => {
    addPracticeSong(data)
    setShowAddModal(false)
  }

  const handleEdit = (data) => {
    updatePracticeSong(editingSong.id, data)
    setEditingSong(null)
  }

  if (practiceSongList.length === 0) {
    return (
      <>
        {showAddModal && <SongModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Practice Lists</h2>
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm px-3 py-1.5">+ Add Song</button>
          </div>
          <div className="card text-center py-14 space-y-4">
            <p className="text-4xl">🎯</p>
            <div>
              <p className="text-gray-200 font-semibold">No practice lists yet</p>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Ask the Coach to build a list — for example:<br />
                <em>"Give me 20 funk songs for practicing strumming and timing"</em>
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setView('coach')}
                className="btn-secondary text-sm"
              >
                🤖 Go to Coach
              </button>
              <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
                + Add manually
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {showAddModal && <SongModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editingSong && <SongModal song={editingSong} onClose={() => setEditingSong(null)} onSave={handleEdit} />}

      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Practice Lists</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {practiceSongList.length} song{practiceSongList.length !== 1 ? 's' : ''} across {categories.length} list{categories.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('coach')} className="btn-secondary text-sm px-3 py-1.5">
              🤖 Ask Coach
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm px-3 py-1.5">
              + Add Song
            </button>
          </div>
        </div>

        {/* Search */}
        {practiceSongList.length > 4 && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs, artists, skills, tags…"
            className="input"
          />
        )}

        {/* Category filter pills */}
        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-gray-100'
              }`}
            >
              All ({practiceSongList.length})
            </button>
            {categories.map((cat) => {
              const count = practiceSongList.filter((s) => s.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-gray-100'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Song lists */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No songs match your search</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, songs]) => (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800/60">
                  <h3 className="text-sm font-semibold text-gray-200">{cat}</h3>
                  <span className="text-xs text-gray-500">{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {songs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      onEdit={() => setEditingSong(song)}
                      onDelete={() => removePracticeSong(song.id)}
                      onMoveToRepertoire={() => moveSongToRepertoire(song.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
