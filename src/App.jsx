import React from 'react'
import useStore from './store/index.js'
import Layout from './components/Layout.jsx'
import SessionBuilder from './components/SessionBuilder/index.jsx'
import Practice from './components/Practice/index.jsx'
import Coach from './components/Coach/index.jsx'
import Repertoire from './components/Repertoire/index.jsx'
import SpotifyCallback from './components/SpotifyCallback.jsx'

export default function App() {
  const view = useStore((s) => s.view)

  // Handle Spotify OAuth callback before rendering the main app
  if (window.location.pathname === '/spotify-callback') {
    return <SpotifyCallback />
  }

  return (
    <Layout>
      {view === 'builder' && <SessionBuilder />}
      {view === 'practice' && <Practice />}
      {view === 'repertoire' && <Repertoire />}
      {view === 'coach' && <Coach />}
    </Layout>
  )
}
