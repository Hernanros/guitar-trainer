// Parses raw pasted tab text from Ultimate Guitar into structured sections.

const SECTION_RE = /^\[([^\]]+)\]/
const TAB_LINE_RE = /^[eEbBgGdDaA]\|/i
const TUNING_RE = /tuning\s*[:\-]?\s*(.+)/i
const CAPO_RE = /capo\s*[:\-]?\s*(\d+)/i

function detectLineType(line) {
  const trimmed = line.trim()
  if (!trimmed) return 'blank'
  if (SECTION_RE.test(trimmed)) return 'section'
  if (TAB_LINE_RE.test(trimmed)) return 'tab'
  // Chord line: mostly uppercase words separated by spaces (Am, G, C/G, Bm7, etc.)
  const words = trimmed.split(/\s+/).filter(Boolean)
  const chordRe = /^[A-G][#b]?(m|maj|min|sus|aug|dim|add|M)?\d*(\/[A-G][#b]?)?$/
  if (words.length > 0 && words.length <= 12 && words.every((w) => chordRe.test(w))) return 'chords'
  return 'text'
}

export function parseTab(raw) {
  if (!raw || typeof raw !== 'string') return { sections: [], capo: 0, tuning: 'Standard' }
  const lines = raw.replace(/\r\n/g, '\n').split('\n')

  // Extract metadata from top of file
  let capo = 0
  let tuning = 'Standard'
  for (const line of lines.slice(0, 20)) {
    const cm = line.match(CAPO_RE)
    if (cm) capo = parseInt(cm[1], 10)
    const tm = line.match(TUNING_RE)
    if (tm) tuning = tm[1].trim()
  }

  // Build sections
  const sections = []
  let current = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const type = detectLineType(line)

    if (type === 'section') {
      const name = line.trim().replace(/^\[|\]$/g, '')
      current = { name, lines: [] }
      sections.push(current)
      continue
    }

    if (!current) {
      current = { name: 'Intro', lines: [] }
      sections.push(current)
    }

    current.lines.push({ text: line, type })
  }

  // Remove trailing blank lines from each section
  for (const section of sections) {
    while (section.lines.length && section.lines[section.lines.length - 1].type === 'blank') {
      section.lines.pop()
    }
  }

  // Drop empty sections
  const filtered = sections.filter((s) => s.lines.length > 0)

  return { sections: filtered, capo, tuning }
}

// Try to extract title/artist from the first few lines of a UG paste
export function extractMeta(raw) {
  if (!raw || typeof raw !== 'string') return { title: '', artist: '' }
  const lines = raw.split('\n').slice(0, 10).map((l) => l.trim()).filter(Boolean)
  let title = ''
  let artist = ''

  for (const line of lines) {
    // UG often starts with "Song Name by Artist" or "Song Name - Artist"
    const byMatch = line.match(/^(.+?)\s+by\s+(.+)$/i)
    if (byMatch) { title = byMatch[1].trim(); artist = byMatch[2].trim(); break }
    const dashMatch = line.match(/^(.+?)\s+[-–]\s+(.+)$/)
    if (dashMatch) { title = dashMatch[1].trim(); artist = dashMatch[2].trim(); break }
  }

  return { title, artist }
}
