import React, { useState } from 'react'
import { getSuggestedSongs, DIFFICULTY_COLORS, GENRE_ICONS } from '../../data/songs.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'

export default function SongSuggestions({ techniques }) {
  const [expanded, setExpanded] = useState(true)
  const songs = getSuggestedSongs(techniques, 6)

  if (!songs.length) return null

  return (
    <div className="card">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎵</span>
          <span className="text-sm font-semibold text-gray-200">Suggested Practice Songs</span>
          <span className="text-xs text-orange-400">({songs.length})</span>
        </div>
        <span className="text-gray-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-gray-500">
            Based on: {[...new Set(techniques)].map((t) => (
              <span key={t} className={`badge ${TECHNIQUE_COLORS[t] || 'bg-gray-700 text-gray-300'} mr-1`}>{t}</span>
            ))}
          </p>

          {songs.map((song) => (
            <div key={song.id} className="bg-gray-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-100">{song.title}</span>
                    <span className="text-xs text-gray-500">— {song.artist}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`badge ${DIFFICULTY_COLORS[song.difficulty]}`}>
                      {song.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      {GENRE_ICONS[song.genre] || '🎵'} {song.genre}
                    </span>
                  </div>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist + ' guitar lesson')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded px-2 py-1 transition-colors"
                  title="Search on YouTube"
                >
                  ▶ Lesson
                </a>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">{song.description}</p>

              <div className="flex gap-1 flex-wrap">
                {song.techniques.map((t) => (
                  <span key={t} className={`badge text-xs ${TECHNIQUE_COLORS[t] || 'bg-gray-700 text-gray-300'}`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
