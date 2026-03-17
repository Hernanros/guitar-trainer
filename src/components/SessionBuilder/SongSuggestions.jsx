import React, { useState, useCallback, useMemo } from 'react'
import { getSuggestedSongs, DIFFICULTY_COLORS, GENRE_ICONS } from '../../data/songs.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'
import { startAuth } from '../../spotify.js'
import useStore from '../../store/index.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SongSuggestions({ techniques }) {
  const { spotify, setSpotifyClientId, disconnectSpotify } = useStore()
  const [expanded, setExpanded] = useState(true)
  const [clientIdInput, setClientIdInput] = useState(spotify.clientId || '')
  const [connecting, setConnecting] = useState(false)
  const [inputError, setInputError] = useState('')
  const [trackSeed, setTrackSeed] = useState(0)

  const reshuffleTracks = useCallback(() => setTrackSeed((s) => s + 1), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visibleTracks = useMemo(() => shuffle(spotify.topTracks || []).slice(0, 8), [trackSeed, spotify.topTracks?.length])

  const preferredGenres = spotify.connected ? spotify.topGenres : []
  const songs = getSuggestedSongs(techniques, preferredGenres, 8)

  const isTokenExpired = spotify.expiresAt && Date.now() > spotify.expiresAt

  const handleConnect = async () => {
    const id = clientIdInput.trim()
    if (!id) { setInputError('Paste your Spotify Client ID first.'); return }
    if (id.length < 20) { setInputError('That doesn\'t look like a valid Client ID.'); return }
    setInputError('')
    setConnecting(true)
    setSpotifyClientId(id)
    await startAuth(id) // redirects away — no need to setConnecting(false)
  }

  const handleReconnect = async () => {
    const id = spotify.clientId
    if (!id) return
    setConnecting(true)
    await startAuth(id)
  }

  if (!songs.length && !techniques.length) return null

  return (
    <div className="card space-y-3">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎵</span>
          <span className="text-sm font-semibold text-gray-200">Suggested Practice Songs</span>
          {songs.length > 0 && <span className="text-xs text-orange-400">({songs.length})</span>}
        </div>
        <span className="text-gray-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          {/* Spotify connection panel */}
          <div className="bg-gray-800 rounded-lg p-3 space-y-2">
            {spotify.connected && !isTokenExpired ? (
              /* Connected state */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs">●</span>
                    <span className="text-xs text-gray-300">
                      Spotify: <strong className="text-green-400">{spotify.displayName}</strong>
                    </span>
                  </div>
                  <button
                    onClick={disconnectSpotify}
                    className="text-xs text-gray-600 hover:text-gray-400"
                  >
                    Disconnect
                  </button>
                </div>
                {spotify.topArtists.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Top artists: {spotify.topArtists.join(', ')}
                  </p>
                )}
                {spotify.topGenres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {spotify.topGenres.map((g) => (
                      <span key={g} className="badge bg-green-900 text-green-300 text-xs">
                        {GENRE_ICONS[g] || '🎵'} {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : isTokenExpired ? (
              /* Token expired */
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-400">Spotify session expired</span>
                <button
                  onClick={handleReconnect}
                  disabled={connecting}
                  className="text-xs text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 rounded px-2 py-1 transition-colors disabled:opacity-50"
                >
                  {connecting ? 'Redirecting…' : 'Reconnect'}
                </button>
              </div>
            ) : (
              /* Not connected */
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  Connect Spotify to personalise suggestions based on what you listen to.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => { setClientIdInput(e.target.value); setInputError('') }}
                    placeholder="Paste Spotify Client ID…"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-600 min-w-0"
                  />
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="shrink-0 text-xs bg-green-700 hover:bg-green-600 text-white font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                  >
                    {connecting ? '…' : '🎵 Connect'}
                  </button>
                </div>
                {inputError && <p className="text-xs text-red-400">{inputError}</p>}
                <p className="text-xs text-gray-500">
                  Get your Client ID at{' '}
                  <a
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-400 underline"
                  >
                    developer.spotify.com/dashboard
                  </a>
                  {' '}→ Create App → set redirect URI to{' '}
                  <code className="text-gray-400">http://127.0.0.1:5173/spotify-callback</code>
                </p>
              </div>
            )}
          </div>

          {/* Top tracks from Spotify */}
          {spotify.connected && spotify.topTracks?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                  ♫ Your top songs to learn
                  <span className="text-gray-500 font-normal normal-case ml-1">({spotify.topTracks.length} total)</span>
                </p>
                <button
                  onClick={reshuffleTracks}
                  className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 rounded px-2 py-0.5 transition-colors"
                >
                  ↺ Reshuffle
                </button>
              </div>
              <div className="space-y-2">
                {visibleTracks.map((track, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-100 truncate font-medium">{track.title}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist + ' guitar lesson')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded px-2 py-1 transition-colors"
                    >
                      ▶ Lesson
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technique tags */}
          {techniques.length > 0 && (
            <p className="text-xs text-gray-500">
              Skills:{' '}
              {[...new Set(techniques)].map((t) => (
                <span key={t} className={`badge ${TECHNIQUE_COLORS[t] || 'bg-gray-700 text-gray-300'} mr-1`}>{t}</span>
              ))}
            </p>
          )}

          {/* Song list */}
          {songs.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">Add exercises to see song suggestions</p>
          ) : (() => {
            const forYou = songs.filter((s) => s.spotifyMatch)
            const others = songs.filter((s) => !s.spotifyMatch)
            const SongCard = (song) => (
              <div
                key={song.id}
                className={`bg-gray-800 rounded-lg p-3 space-y-1.5 ${song.spotifyMatch ? 'ring-1 ring-green-700' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-gray-100">{song.title}</span>
                      <span className="text-xs text-gray-500">— {song.artist}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`badge ${DIFFICULTY_COLORS[song.difficulty]}`}>{song.difficulty}</span>
                      <span className="text-xs text-gray-500">{GENRE_ICONS[song.genre] || '🎵'} {song.genre}</span>
                    </div>
                  </div>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist + ' guitar lesson')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-orange-400 hover:text-orange-300 border border-orange-800 hover:border-orange-600 rounded px-2 py-1 transition-colors"
                  >
                    ▶ Lesson
                  </a>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{song.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {song.techniques.map((t) => (
                    <span key={t} className={`badge text-xs ${TECHNIQUE_COLORS[t] || 'bg-gray-700 text-gray-300'}`}>{t}</span>
                  ))}
                </div>
              </div>
            )
            return (
              <div className="space-y-4">
                {forYou.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                      ♫ Based on your Spotify taste
                    </p>
                    <div className="space-y-3">{forYou.map(SongCard)}</div>
                  </div>
                )}
                {others.length > 0 && (
                  <div className="space-y-2">
                    {forYou.length > 0 && (
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Other suggestions</p>
                    )}
                    <div className="space-y-3">{others.map(SongCard)}</div>
                  </div>
                )}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
