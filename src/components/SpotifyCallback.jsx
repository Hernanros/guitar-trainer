import React, { useEffect, useState } from 'react'
import { exchangeCode, fetchTopArtists, fetchProfile, extractOurGenres } from '../spotify.js'
import useStore from '../store/index.js'

export default function SpotifyCallback() {
  const { setSpotifyConnected } = useStore()
  const [status, setStatus] = useState('Connecting to Spotify…')
  const [error, setError] = useState(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    // Safety escape hatch — if nothing happens in 15s, show an error
    const timeout = setTimeout(() => setTimedOut(true), 15000)

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const errorParam = params.get('error')

      if (errorParam) {
        setError(
          errorParam === 'access_denied'
            ? 'You cancelled the Spotify login. Try connecting again.'
            : `Spotify returned an error: ${errorParam}`
        )
        return
      }

      if (!code) {
        setError('No authorization code in the URL. Try connecting again from the app.')
        return
      }

      // Check sessionStorage is intact (gets wiped if user navigated away mid-flow)
      const verifier = sessionStorage.getItem('spotify_verifier')
      if (!verifier) {
        setError('Login session expired — the browser lost the auth state. Go back to the app and try connecting again.')
        return
      }

      try {
        setStatus('Exchanging authorization code…')
        const tokenData = await exchangeCode(code, state)

        setStatus('Fetching your top artists…')
        const [artists, profile] = await Promise.all([
          fetchTopArtists(tokenData.access_token),
          fetchProfile(tokenData.access_token),
        ])

        const allGenres = artists.flatMap((a) => a.genres)
        const ourGenres = extractOurGenres(allGenres)
        const topArtistNames = artists.slice(0, 5).map((a) => a.name)

        setSpotifyConnected({
          accessToken: tokenData.access_token,
          expiresAt: Date.now() + tokenData.expires_in * 1000,
          displayName: profile.display_name || profile.id,
          topGenres: ourGenres,
          topArtists: topArtistNames,
        })

        clearTimeout(timeout)
        window.location.href = '/'
      } catch (err) {
        setError(err.message)
      }
    }

    handleCallback()
    return () => clearTimeout(timeout)
  }, [])

  if (error || timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="card max-w-sm w-full text-center space-y-4">
          <p className="text-3xl">❌</p>
          <h2 className="text-lg font-bold text-gray-100">Spotify Connection Failed</h2>
          <p className="text-sm text-red-400">
            {timedOut && !error
              ? 'Timed out waiting for Spotify. The redirect may not have reached the app.'
              : error}
          </p>
          <div className="text-xs text-gray-500 bg-gray-800 rounded-lg p-3 text-left space-y-1">
            <p className="font-semibold text-gray-400">Checklist:</p>
            <p>✓ App running at <code className="text-orange-400">http://127.0.0.1:5173</code></p>
            <p>✓ Redirect URI in Spotify dashboard: <code className="text-orange-400">http://127.0.0.1:5173/spotify-callback</code></p>
            <p>✓ Open the app using <code className="text-orange-400">127.0.0.1</code>, not <code className="text-orange-400">localhost</code></p>
          </div>
          <a href="/" className="btn-primary inline-block w-full">← Back to app</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="card max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-300">{status}</p>
        <a
          href="/"
          className="text-xs text-gray-600 hover:text-gray-400 underline block"
        >
          Cancel and go back
        </a>
      </div>
    </div>
  )
}
