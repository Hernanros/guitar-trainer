import React from 'react'
import useStore from './store/index.js'
import Layout from './components/Layout.jsx'
import SessionBuilder from './components/SessionBuilder/index.jsx'
import Practice from './components/Practice/index.jsx'
import Coach from './components/Coach/index.jsx'

export default function App() {
  const view = useStore((s) => s.view)

  return (
    <Layout>
      {view === 'builder' && <SessionBuilder />}
      {view === 'practice' && <Practice />}
      {view === 'coach' && <Coach />}
    </Layout>
  )
}
