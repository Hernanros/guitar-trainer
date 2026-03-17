import React, { useState } from 'react'
import useStore from '../../store/index.js'

function ScoreRing({ score }) {
  if (score === null) return null
  const color = score >= 80 ? 'text-green-400' : score >= 55 ? 'text-yellow-400' : 'text-red-400'
  const label = score >= 80 ? 'Great timing' : score >= 55 ? 'Keep practicing' : 'Focus on the beat'
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-4xl font-bold ${color}`}>{score}%</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}

function VolumeBar({ volume }) {
  const bars = 12
  const filled = Math.round((volume / 100) * bars)
  return (
    <div className="flex items-end gap-0.5 h-6">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{ height: `${40 + i * 5}%` }}
          className={`w-1.5 rounded-sm transition-all duration-75 ${
            i < filled
              ? i < 4 ? 'bg-green-500' : i < 9 ? 'bg-orange-500' : 'bg-red-500'
              : 'bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

export default function PerformanceListener({ analyzer, exercise, isMetronomePlaying }) {
  const {
    isListening, volume, detectedNote, sessionStats,
    audioDevices, selectedDeviceId, setSelectedDeviceId,
    start, stop,
  } = analyzer
  const { setView, appendCoachMessage, setCoachApiMessages, coachApiMessages } = useStore()
  const [error, setError] = useState(null)
  const [stopped, setStopped] = useState(false)

  const handleToggle = async () => {
    if (isListening) {
      stop()
      setStopped(true)
    } else {
      try {
        setError(null)
        setStopped(false)
        await start()
      } catch (err) {
        setError('Microphone access denied. Check your browser permissions.')
      }
    }
  }

  const handleSendToCoach = () => {
    if (!sessionStats || !exercise) return
    const s = sessionStats
    const msg = `I just practiced "${exercise.name}" (${exercise.technique}, ${exercise.targetBpm} BPM target).
Here are my performance stats:
- Duration: ${s.duration}s
- Notes detected: ${s.notesDetected}
- Timing score: ${s.timingScore !== null ? s.timingScore + '%' : 'N/A'} (${s.inTimeNotes} of ${s.notesDetected} notes were on the beat)
- Metronome beats recorded: ${s.beatsRecorded}

Based on these stats, what should I focus on to improve?`

    const userMsg = { role: 'user', content: msg }
    appendCoachMessage(userMsg)
    setCoachApiMessages([...coachApiMessages, userMsg])
    setView('coach')
  }

  return (
    <div className={`card space-y-3 ${isListening ? 'border-orange-600' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-300">Performance Listener</span>
          {isListening && (
            <span className="flex items-center gap-1 text-xs text-orange-400">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              Listening
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-800 hover:bg-red-700 text-red-200'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          {isListening ? '⏹ Stop' : '🎙 Listen'}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Audio device selector */}
      {!isListening && audioDevices.length > 1 && (
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
        >
          <option value="">Default microphone</option>
          {audioDevices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Input ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      )}

      {!isListening && !stopped && !error && (
        <p className="text-xs text-gray-500">
          Start the metronome, then tap Listen — the app will score your timing and detect the notes you play.
        </p>
      )}

      {isListening && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <VolumeBar volume={volume} />
            <p className="text-xs text-gray-400">Input level</p>
          </div>
          <div className="text-right">
            {detectedNote ? (
              <>
                <p className="text-2xl font-bold text-orange-400">{detectedNote}</p>
                <p className="text-xs text-gray-400">Detected note</p>
              </>
            ) : (
              <p className="text-xs text-gray-500">Play a note…</p>
            )}
          </div>
        </div>
      )}

      {!isListening && stopped && sessionStats && (
        <div className="space-y-3">
          <div className="flex items-center justify-around py-2">
            <ScoreRing score={sessionStats.timingScore} />
            <div className="text-center space-y-2">
              <div>
                <p className="text-2xl font-bold text-gray-100">{sessionStats.notesDetected}</p>
                <p className="text-xs text-gray-400">Notes detected</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-300">{sessionStats.duration}s</p>
                <p className="text-xs text-gray-400">Duration</p>
              </div>
            </div>
          </div>

          {sessionStats.timingScore !== null && (
            <div className="text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-2">
              {sessionStats.timingScore >= 80
                ? '✓ Your timing is solid. Try increasing the BPM by 5.'
                : sessionStats.timingScore >= 55
                ? '↗ Timing is developing. Keep the metronome running and slow down if needed.'
                : '! Focus on one beat at a time — try practicing with just beats 1 and 3 first.'}
            </div>
          )}

          <button onClick={handleSendToCoach} className="btn-primary w-full text-sm">
            Send to Coach for Detailed Feedback
          </button>
        </div>
      )}
    </div>
  )
}
