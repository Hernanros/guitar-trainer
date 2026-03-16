import { useRef, useState, useCallback, useEffect } from 'react'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const ONSET_THRESHOLD = 0.015   // RMS energy to count as a note onset
const ONSET_COOLDOWN_MS = 80    // ignore onsets closer together than this
const TIMING_WINDOW_MS = 100    // onset within ±100ms of a beat = "in time"

function freqToNote(freq) {
  if (freq <= 0) return null
  const halfSteps = Math.round(12 * Math.log2(freq / 440))
  const noteIndex = ((halfSteps % 12) + 12) % 12
  const octave = Math.floor((halfSteps + 9) / 12) + 4
  return NOTE_NAMES[noteIndex] + octave
}

// Autocorrelation-based pitch detection — reliable for single notes on guitar
function detectPitch(buffer, sampleRate) {
  const SIZE = buffer.length
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.008) return -1 // too quiet

  // Find best lag via autocorrelation
  let bestLag = -1
  let bestCorr = 0
  let lastCorr = 1
  let foundGoodCorr = false
  const minPeriod = Math.floor(sampleRate / 1500) // ~1500 Hz max (high E string harmonics)
  const maxPeriod = Math.floor(sampleRate / 60)   // ~60 Hz min (low B in dropped tuning)

  for (let lag = minPeriod; lag <= maxPeriod; lag++) {
    let corr = 0
    for (let i = 0; i < SIZE - lag; i++) corr += buffer[i] * buffer[i + lag]
    corr /= SIZE - lag

    if (!foundGoodCorr && corr > 0.9) foundGoodCorr = true

    if (foundGoodCorr && corr < lastCorr) {
      // We just passed a local maximum
      if (lastCorr > bestCorr) {
        bestCorr = lastCorr
        bestLag = lag - 1
      }
      if (corr < 0.15) break // strong peak found, stop early
    }
    lastCorr = corr
  }

  if (bestLag < 0 || bestCorr < 0.2) return -1
  return sampleRate / bestLag
}

export function useAudioAnalyzer() {
  const [isListening, setIsListening] = useState(false)
  const [volume, setVolume] = useState(0)
  const [detectedNote, setDetectedNote] = useState(null)
  const [timingScore, setTimingScore] = useState(null)
  const [sessionStats, setSessionStats] = useState(null)
  const [audioDevices, setAudioDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')

  // Load available audio input devices
  useEffect(() => {
    async function loadDevices() {
      try {
        // Request permission first so device labels are visible
        await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop()))
        const devices = await navigator.mediaDevices.enumerateDevices()
        const inputs = devices.filter((d) => d.kind === 'audioinput')
        setAudioDevices(inputs)
      } catch {
        // Permission not granted yet — devices will load when user clicks Listen
      }
    }
    loadDevices()
    navigator.mediaDevices.addEventListener('devicechange', loadDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', loadDevices)
  }, [])

  const audioCtxRef = useRef(null)
  const streamRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)

  // Beat timestamps recorded while metronome runs — set by Practice component
  const beatTimesRef = useRef([])
  const onsetTimesRef = useRef([])
  const lastOnsetRef = useRef(0)
  const sessionStartRef = useRef(0)

  const recordBeat = useCallback((time = Date.now()) => {
    beatTimesRef.current.push(time)
  }, [])

  const start = useCallback(async () => {
    try {
      const audioConstraints = selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : true
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false })

      // Refresh device list now that we have permission (labels become visible)
      const devices = await navigator.mediaDevices.enumerateDevices()
      setAudioDevices(devices.filter((d) => d.kind === 'audioinput'))
      streamRef.current = stream

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.5
      source.connect(analyser)
      analyserRef.current = analyser

      beatTimesRef.current = []
      onsetTimesRef.current = []
      sessionStartRef.current = Date.now()
      setTimingScore(null)
      setSessionStats(null)

      const floatBuf = new Float32Array(analyser.fftSize)
      const byteBuf = new Uint8Array(analyser.fftSize)
      let prevRms = 0

      const loop = () => {
        animFrameRef.current = requestAnimationFrame(loop)

        // Volume
        analyser.getByteTimeDomainData(byteBuf)
        let sum = 0
        for (let i = 0; i < byteBuf.length; i++) {
          const v = (byteBuf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / byteBuf.length)
        setVolume(Math.min(100, Math.round(rms * 400)))

        // Onset detection: energy spike over threshold
        const now = Date.now()
        if (rms > ONSET_THRESHOLD && prevRms < ONSET_THRESHOLD && (now - lastOnsetRef.current) > ONSET_COOLDOWN_MS) {
          onsetTimesRef.current.push(now)
          lastOnsetRef.current = now
        }
        prevRms = rms

        // Pitch detection
        analyser.getFloatTimeDomainData(floatBuf)
        const freq = detectPitch(floatBuf, ctx.sampleRate)
        if (freq > 0) {
          setDetectedNote(freqToNote(freq))
        }
      }
      loop()
      setIsListening(true)
    } catch (err) {
      console.error('[AudioAnalyzer] Mic access failed:', err)
      throw err
    }
  }, [])

  const stop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    setIsListening(false)
    setVolume(0)
    setDetectedNote(null)

    // Calculate timing score
    const onsets = onsetTimesRef.current
    const beats = beatTimesRef.current
    const duration = (Date.now() - sessionStartRef.current) / 1000

    let inTime = 0
    for (const onset of onsets) {
      const nearest = beats.reduce((best, b) => Math.abs(b - onset) < Math.abs(best - onset) ? b : best, Infinity)
      if (Math.abs(nearest - onset) <= TIMING_WINDOW_MS) inTime++
    }

    const score = onsets.length > 0 ? Math.round((inTime / onsets.length) * 100) : null
    setTimingScore(score)

    const stats = {
      duration: Math.round(duration),
      notesDetected: onsets.length,
      beatsRecorded: beats.length,
      timingScore: score,
      inTimeNotes: inTime,
    }
    setSessionStats(stats)
    return stats
  }, [])

  return {
    isListening,
    volume,
    detectedNote,
    timingScore,
    sessionStats,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    recordBeat,
    start,
    stop,
  }
}
