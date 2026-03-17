import React from 'react'
import useStore from './store/index.js'
import Layout from './components/Layout.jsx'
import SessionBuilder from './components/SessionBuilder/index.jsx'
import Practice from './components/Practice/index.jsx'
import Coach from './components/Coach/index.jsx'
import Repertoire from './components/Repertoire/index.jsx'
import Tabs from './components/Tabs/index.jsx'
import PracticeList from './components/PracticeList/index.jsx'
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
      {view === 'lists' && <PracticeList />}
      {view === 'repertoire' && <Repertoire />}
      {view === 'tabs' && <Tabs />}
      {view === 'coach' && <Coach />}
    </Layout>
  )
}
