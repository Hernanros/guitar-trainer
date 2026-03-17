import React from 'react'
import useStore from '../store/index.js'

const REVIEW_DAYS = { learning: 7, 'can play': 21 }
function isDue(s) {
  const t = REVIEW_DAYS[s.status]
  if (!t) return false
  if (!s.lastPracticedAt) return s.practiceCount === 0
  return Math.floor((Date.now() - s.lastPracticedAt) / 86400000) >= t
}

const TABS = [
  { id: 'builder',    label: 'Session',     icon: '🎵' },
  { id: 'practice',  label: 'Practice',    icon: '🎸' },
  { id: 'repertoire',label: 'Repertoire',  icon: '🎼' },
  { id: 'tabs',      label: 'Tabs',        icon: '📄' },
  { id: 'coach',     label: 'Coach',       icon: '🤖' },
]

export default function Layout({ children }) {
  const { view, setView, currentSession, songLog } = useStore()
  const dueSongs = songLog.filter(isDue).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🎸</span>
            <h1 className="text-base font-bold text-orange-400 hidden sm:block">Guitar Trainer</h1>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150 whitespace-nowrap
                  ${view === tab.id
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }
                `}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>

                {tab.id === 'practice' && currentSession.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 border-2 border-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {currentSession.length}
                  </span>
                )}
                {tab.id === 'repertoire' && dueSongs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 border-2 border-gray-900 text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {dueSongs}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
