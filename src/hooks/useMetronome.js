import { useRef, useCallback, useEffect } from 'react'

const LOOKAHEAD_MS = 25.0
const SCHEDULE_AHEAD_S = 0.1

export function useMetronome({ bpm, beatsPerMeasure = 4, onBeat }) {
  const audioCtxRef = useRef(null)
  const timerRef = useRef(null)
  const nextNoteTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const bpmRef = useRef(bpm)
  const onBeatRef = useRef(onBeat)
  const isPlayingRef = useRef(false)

  // Keep refs in sync without triggering restarts
  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { onBeatRef.current = onBeat }, [onBeat])

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  const scheduleNote = useCallback((beatNumber, time) => {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const isAccent = beatNumber === 0
    osc.frequency.value = isAccent ? 1000 : 800
    gain.gain.setValueAtTime(isAccent ? 0.8 : 0.5, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

    osc.start(time)
    osc.stop(time + 0.05)

    // Schedule the visual callback slightly before to account for render lag
    const delay = (time - ctx.currentTime) * 1000
    setTimeout(() => {
      if (onBeatRef.current) onBeatRef.current(beatNumber)
    }, Math.max(0, delay - 10))
  }, [getAudioCtx])

  const scheduler = useCallback(() => {
    const ctx = getAudioCtx()
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      scheduleNote(currentBeatRef.current, nextNoteTimeRef.current)
      const secondsPerBeat = 60.0 / bpmRef.current
      nextNoteTimeRef.current += secondsPerBeat
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasure
    }
  }, [getAudioCtx, scheduleNote, beatsPerMeasure])

  const start = useCallback(() => {
    if (isPlayingRef.current) return
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    isPlayingRef.current = true
    currentBeatRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05

    timerRef.current = setInterval(scheduler, LOOKAHEAD_MS)
  }, [getAudioCtx, scheduler])

  const stop = useCallback(() => {
    if (!isPlayingRef.current) return
    isPlayingRef.current = false
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop()
    } else {
      start()
    }
    return !isPlayingRef.current
  }, [start, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    }
  }, [stop])

  return { start, stop, toggle, isPlayingRef }
}
