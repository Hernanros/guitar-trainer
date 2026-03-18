import { useRef, useCallback, useEffect } from 'react'

const LOOKAHEAD_MS = 25.0
const SCHEDULE_AHEAD_S = 0.1

export const SUBDIVS_PER_BEAT = {
  quarter: 1,
  eighth: 2,
  'eighth-triplet': 3,
  sixteenth: 4,
}

export function useMetronome({ bpm, beatsPerMeasure = 4, subdivision = 'quarter', onBeat }) {
  const audioCtxRef = useRef(null)
  const timerRef = useRef(null)
  const nextNoteTimeRef = useRef(0)
  const currentTickRef = useRef(0)
  const bpmRef = useRef(bpm)
  const onBeatRef = useRef(onBeat)
  const isPlayingRef = useRef(false)
  const subdivRef = useRef(subdivision)
  const beatsRef = useRef(beatsPerMeasure)

  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { onBeatRef.current = onBeat }, [onBeat])
  useEffect(() => { subdivRef.current = subdivision }, [subdivision])
  useEffect(() => { beatsRef.current = beatsPerMeasure }, [beatsPerMeasure])

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  const scheduleNote = useCallback((tickIndex, time) => {
    const ctx = getAudioCtx()
    const subdivsPerBeat = SUBDIVS_PER_BEAT[subdivRef.current] || 1
    const isMainBeat = tickIndex % subdivsPerBeat === 0
    const isAccent = tickIndex === 0

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (isAccent) {
      osc.frequency.value = 1000
      gain.gain.setValueAtTime(0.8, time)
    } else if (isMainBeat) {
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0.5, time)
    } else {
      osc.frequency.value = 600
      gain.gain.setValueAtTime(0.2, time)
    }
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

    osc.start(time)
    osc.stop(time + 0.05)

    const delay = (time - ctx.currentTime) * 1000
    setTimeout(() => {
      if (onBeatRef.current) onBeatRef.current(tickIndex)
    }, Math.max(0, delay - 10))
  }, [getAudioCtx])

  const scheduler = useCallback(() => {
    const ctx = getAudioCtx()
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      scheduleNote(currentTickRef.current, nextNoteTimeRef.current)
      const subdivsPerBeat = SUBDIVS_PER_BEAT[subdivRef.current] || 1
      const secondsPerTick = 60.0 / bpmRef.current / subdivsPerBeat
      nextNoteTimeRef.current += secondsPerTick
      const totalTicks = beatsRef.current * subdivsPerBeat
      currentTickRef.current = (currentTickRef.current + 1) % totalTicks
    }
  }, [getAudioCtx, scheduleNote])

  const start = useCallback(() => {
    if (isPlayingRef.current) return
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    isPlayingRef.current = true
    currentTickRef.current = 0
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
