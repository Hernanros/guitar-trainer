import React, { useState, useRef, useEffect, useCallback } from 'react'
import useStore from '../../store/index.js'
import { parseTab, extractMeta } from './parseTab.js'

// ── Import Modal ──────────────────────────────────────────────────────────────

function ImportModal({ onClose }) {
  const { addTab, songLog } = useStore()
  const [step, setStep] = useState('paste') // paste | meta
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [capo, setCapo] = useState(0)
  const [tuning, setTuning] = useState('Standard')
  const [linkedSongId, setLinkedSongId] = useState('')
  const [error, setError] = useState('')

  const handleParse = () => {
    if (!raw.trim()) { setError('Paste a tab first.'); return }
    const result = parseTab(raw)
    if (!result.sections.length) { setError("Couldn't find any sections — make sure you copied the full tab."); return }
    const meta = extractMeta(raw)
    setTitle(meta.title || '')
    setArtist(meta.artist || '')
    setCapo(result.capo)
    setTuning(result.tuning)
    setParsed(result)
    setStep('meta')
  }

  const handleSave = () => {
    if (!title.trim()) { setError('Add a title.'); return }
    addTab({ title, artist, content: raw, capo, tuning, linkedSongId: linkedSongId || null })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-gray-100">
            {step === 'paste' ? 'Import Tab' : 'Tab Details'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        {step === 'paste' ? (
          <>
            <div className="space-y-2 flex-1 flex flex-col">
              <p className="text-xs text-gray-400">
                Open any tab on <strong className="text-gray-200">Ultimate Guitar</strong>, select all the tab text, copy, and paste it below.
              </p>
              <textarea
                autoFocus
                value={raw}
                onChange={(e) => { setRaw(e.target.value); setError('') }}
                placeholder="Paste tab text here…"
                className="flex-1 min-h-[300px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 font-mono resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-400 shrink-0">{error}</p>}
            <div className="flex gap-3 shrink-0">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleParse} className="btn-primary flex-1">Parse Tab →</button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 overflow-y-auto flex-1">
              {/* Preview */}
              <div className="bg-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-1">
                  Found {parsed.sections.length} sections: {parsed.sections.map((s) => s.name).join(', ')}
                </p>
                <p className="text-xs text-gray-400 font-mono whitespace-pre overflow-x-auto">
                  {parsed.sections[0]?.lines.slice(0, 8).map((l) => l.text).join('\n')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                  <input
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError('') }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Artist</label>
                  <input
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tuning</label>
                  <input
                    value={tuning}
                    onChange={(e) => setTuning(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Capo (fret)</label>
                  <input
                    type="number" min={0} max={12}
                    value={capo}
                    onChange={(e) => setCapo(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {songLog.length > 0 && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Link to Repertoire song (optional)</label>
                  <select
                    value={linkedSongId}
                    onChange={(e) => setLinkedSongId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">— not linked —</option>
                    {songLog.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}{s.artist ? ` — ${s.artist}` : ''}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-400 shrink-0">{error}</p>}
            <div className="flex gap-3 shrink-0">
              <button onClick={() => setStep('paste')} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleSave} className="btn-primary flex-1">Save Tab</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Tab Viewer ────────────────────────────────────────────────────────────────

function TabViewer({ tab, onClose }) {
  const { updateTab, removeTab } = useStore()
  const [fontSize, setFontSize] = useState(13)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(1.5) // px per frame
  const [activeSection, setActiveSection] = useState(0)
  const scrollRef = useRef(null)
  const rafRef = useRef(null)
  const parsed = parseTab(tab.content)
  const sectionRefs = useRef([])

  // Auto-scroll loop
  useEffect(() => {
    if (!autoScroll) { cancelAnimationFrame(rafRef.current); return }
    const step = () => {
      if (scrollRef.current) scrollRef.current.scrollTop += scrollSpeed
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [autoScroll, scrollSpeed])

  // Track active section on scroll
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const scrollTop = container.scrollTop
    let active = 0
    sectionRefs.current.forEach((el, i) => {
      if (el && el.offsetTop - 80 <= scrollTop) active = i
    })
    setActiveSection(active)
  }, [])

  const jumpToSection = (i) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const confirmDelete = () => {
    if (window.confirm(`Delete "${tab.title}"?`)) { removeTab(tab.id); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-gray-800 bg-gray-900 px-4 py-2 flex items-center gap-3 flex-wrap">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-100 text-sm font-medium">
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-100 truncate">{tab.title}</span>
          {tab.artist && <span className="text-xs text-gray-500 ml-2">{tab.artist}</span>}
          {tab.capo > 0 && <span className="text-xs text-orange-400 ml-2">Capo {tab.capo}</span>}
          {tab.tuning && tab.tuning !== 'Standard' && <span className="text-xs text-gray-500 ml-2">{tab.tuning}</span>}
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1">
          <button onClick={() => setFontSize((f) => Math.max(10, f - 1))} className="btn-secondary !px-2 !py-1 text-xs">A−</button>
          <button onClick={() => setFontSize((f) => Math.min(20, f + 1))} className="btn-secondary !px-2 !py-1 text-xs">A+</button>
        </div>

        {/* Auto-scroll */}
        <div className="flex items-center gap-2">
          {autoScroll && (
            <input
              type="range" min={0.5} max={5} step={0.5}
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-20 accent-orange-500"
              title="Scroll speed"
            />
          )}
          <button
            onClick={() => setAutoScroll((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              autoScroll ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {autoScroll ? '⏸ Scrolling' : '▶ Auto-scroll'}
          </button>
        </div>

        <button onClick={confirmDelete} className="text-xs text-red-600 hover:text-red-400">Delete</button>
      </div>

      {/* Section nav */}
      {parsed.sections.length > 1 && (
        <div className="shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-1.5 flex gap-1 overflow-x-auto">
          {parsed.sections.map((s, i) => (
            <button
              key={i}
              onClick={() => jumpToSection(i)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeSection === i ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-100'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {parsed.sections.map((section, si) => (
            <div
              key={si}
              ref={(el) => (sectionRefs.current[si] = el)}
            >
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">
                {section.name}
              </h3>
              <div className="space-y-0">
                {section.lines.map((line, li) => {
                  if (line.type === 'blank') return <div key={li} className="h-3" />
                  if (line.type === 'tab') return (
                    <div
                      key={li}
                      style={{ fontSize }}
                      className="font-mono text-green-400 whitespace-pre overflow-x-auto leading-snug"
                    >
                      {line.text}
                    </div>
                  )
                  if (line.type === 'chords') return (
                    <div
                      key={li}
                      style={{ fontSize }}
                      className="font-mono text-orange-300 whitespace-pre overflow-x-auto leading-snug font-semibold"
                    >
                      {line.text}
                    </div>
                  )
                  return (
                    <div
                      key={li}
                      style={{ fontSize }}
                      className="font-mono text-gray-300 whitespace-pre overflow-x-auto leading-snug"
                    >
                      {line.text}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Tabs View ─────────────────────────────────────────────────────────────

export default function Tabs() {
  const { tabLibrary, songLog } = useStore()
  const [showImport, setShowImport] = useState(false)
  const [viewingTab, setViewingTab] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = tabLibrary.filter((t) =>
    !search ||
    (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.artist || '').toLowerCase().includes(search.toLowerCase())
  )

  if (viewingTab) {
    const tab = tabLibrary.find((t) => t.id === viewingTab)
    if (tab) return <TabViewer tab={tab} onClose={() => setViewingTab(null)} />
  }

  return (
    <>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Tabs</h2>
            <p className="text-xs text-gray-500 mt-0.5">{tabLibrary.length} saved tab{tabLibrary.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowImport(true)} className="btn-primary text-sm px-3 py-1.5">
            + Import Tab
          </button>
        </div>

        {tabLibrary.length > 1 && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tabs…"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        )}

        {tabLibrary.length === 0 ? (
          <div className="card text-center py-12 space-y-3">
            <p className="text-4xl">🎼</p>
            <p className="text-gray-300 font-medium">No tabs yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Open any tab on Ultimate Guitar, copy the text, and paste it here. Works with tabs, chords, and chord+tab combos.
            </p>
            <button onClick={() => setShowImport(true)} className="btn-primary mx-auto">+ Import your first tab</button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No tabs match your search</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((tab) => {
              const linked = tab.linkedSongId ? songLog.find((s) => s.id === tab.linkedSongId) : null
              const parsed = parseTab(tab.content)
              return (
                <div
                  key={tab.id}
                  onClick={() => setViewingTab(tab.id)}
                  className="card cursor-pointer hover:border-orange-700 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-100 group-hover:text-orange-400 transition-colors">
                        {tab.title}
                      </p>
                      {tab.artist && <p className="text-xs text-gray-500 mt-0.5">{tab.artist}</p>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {tab.capo > 0 && (
                          <span className="badge bg-gray-700 text-gray-300 text-xs">Capo {tab.capo}</span>
                        )}
                        {tab.tuning && tab.tuning !== 'Standard' && (
                          <span className="badge bg-gray-700 text-gray-300 text-xs">{tab.tuning}</span>
                        )}
                        <span className="text-xs text-gray-600">
                          {parsed.sections.length} section{parsed.sections.length !== 1 ? 's' : ''}
                        </span>
                        {linked && (
                          <span className="badge bg-green-900 text-green-400 text-xs">
                            ♫ {linked.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-600 group-hover:text-orange-400 transition-colors text-lg">→</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
