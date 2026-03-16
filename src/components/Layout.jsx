import React from 'react'
import useStore from '../store/index.js'

const TABS = [
  { id: 'builder', label: 'Session Builder', icon: '🎵' },
  { id: 'practice', label: 'Practice', icon: '🎸' },
  { id: 'coach', label: 'AI Coach', icon: '🤖' },
]

export default function Layout({ children }) {
  const { view, setView, currentSession } = useStore()

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎸</span>
            <h1 className="text-lg font-bold text-orange-400">Guitar Trainer</h1>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${view === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === 'practice' && currentSession.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {currentSession.length}
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
