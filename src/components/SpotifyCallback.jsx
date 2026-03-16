import React, { useEffect, useState } from 'react'
import { exchangeCode, fetchTopArtists, fetchProfile, extractOurGenres } from '../spotify.js'
import useStore from '../store/index.js'

export default function SpotifyCallback() {
  const { setSpotifyConnected } = useStore()
  const [status, setStatus] = useState('Connecting to Spotify…')
  const [error, setError] = useState(null)

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const errorParam = params.get('error')

      if (errorParam) {
        setError(`Spotify denied access: ${errorParam}`)
        return
      }
      if (!code) {
        setError('No authorization code received.')
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

        // Collect all genre strings from top artists
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

        // Redirect back to the main app
        window.location.href = '/'
      } catch (err) {
        setError(err.message)
      }
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="card max-w-sm text-center space-y-4">
          <p className="text-3xl">❌</p>
          <h2 className="text-lg font-bold text-gray-100">Spotify Connection Failed</h2>
          <p className="text-sm text-red-400">{error}</p>
          <a href="/" className="btn-primary inline-block">Back to app</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="card max-w-sm text-center space-y-4">
        <p className="text-3xl animate-spin">⚙️</p>
        <p className="text-sm text-gray-300">{status}</p>
      </div>
    </div>
  )
}
