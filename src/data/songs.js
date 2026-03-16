// Each song has one or more technique tags matching the exercise technique categories.
// difficulty: 'beginner' | 'intermediate' | 'advanced'
export const SONG_LIBRARY = [
  // ── SCALES ──────────────────────────────────────────────────────────────────
  {
    id: 'song-001',
    title: 'Comfortably Numb – Solo',
    artist: 'Pink Floyd',
    techniques: ['scales', 'legato'],
    difficulty: 'intermediate',
    genre: 'rock',
    description: 'David Gilmour\'s iconic outro solo is built almost entirely on the minor pentatonic. Focus on expressive bends and vibrato over scale runs.',
  },
  {
    id: 'song-002',
    title: 'Stairway to Heaven – Solo',
    artist: 'Led Zeppelin',
    techniques: ['scales', 'fingerpicking'],
    difficulty: 'intermediate',
    genre: 'rock',
    description: 'Jimmy Page moves through A minor pentatonic and natural minor. Great for connecting scale positions across the neck.',
  },
  {
    id: 'song-003',
    title: 'Hotel California – Lead Guitar',
    artist: 'Eagles',
    techniques: ['scales', 'arpeggios'],
    difficulty: 'intermediate',
    genre: 'rock',
    description: 'The twin guitar lead uses B minor scale patterns with melodic arpeggios. An elegant study in musical phrasing.',
  },
  {
    id: 'song-004',
    title: 'Mr. Crowley – Solo',
    artist: 'Ozzy Osbourne (Randy Rhoads)',
    techniques: ['scales', 'arpeggios', 'picking'],
    difficulty: 'advanced',
    genre: 'metal',
    description: 'Randy Rhoads blends classical scales, arpeggios, and alternate picking. A milestone in neo-classical rock soloing.',
  },
  {
    id: 'song-005',
    title: 'Sultans of Swing – Solo',
    artist: 'Dire Straits',
    techniques: ['scales', 'fingerpicking'],
    difficulty: 'intermediate',
    genre: 'rock',
    description: 'Mark Knopfler\'s fingerpicked lead lines flow through D minor pentatonic. Focuses on tone, dynamics, and musical storytelling.',
  },

  // ── ARPEGGIOS ────────────────────────────────────────────────────────────────
  {
    id: 'song-006',
    title: 'Eruption',
    artist: 'Van Halen',
    techniques: ['arpeggios', 'legato', 'picking'],
    difficulty: 'advanced',
    genre: 'rock',
    description: 'Eddie Van Halen\'s two-handed tapping showcase. The arpeggio sections are essential study material for sweep and tap technique.',
  },
  {
    id: 'song-007',
    title: 'Far Beyond the Sun',
    artist: 'Yngwie Malmsteen',
    techniques: ['arpeggios', 'scales', 'picking'],
    difficulty: 'advanced',
    genre: 'metal',
    description: 'Neo-classical arpeggios and scale runs at high speed. The definitive study piece for sweep picking and economy picking.',
  },
  {
    id: 'song-008',
    title: 'Technical Difficulties',
    artist: 'Racer X',
    techniques: ['arpeggios', 'picking'],
    difficulty: 'advanced',
    genre: 'metal',
    description: 'Paul Gilbert\'s precision picking through arpeggios and sequences. Demanding right-hand accuracy at high tempos.',
  },
  {
    id: 'song-009',
    title: 'Dee',
    artist: 'Ozzy Osbourne (Randy Rhoads)',
    techniques: ['arpeggios', 'fingerpicking'],
    difficulty: 'intermediate',
    genre: 'classical',
    description: 'A classical-style solo fingerstyle piece. Beautiful arpeggiated chord progressions for developing right-hand independence.',
  },

  // ── CHORDS ───────────────────────────────────────────────────────────────────
  {
    id: 'song-010',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    techniques: ['chords', 'fingerpicking'],
    difficulty: 'beginner',
    genre: 'rock',
    description: 'Open chord fingerpicking intro with a G–C–D–Am progression. One of the best songs for beginners to learn real musicality.',
  },
  {
    id: 'song-011',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    techniques: ['chords', 'fingerpicking'],
    difficulty: 'beginner',
    genre: 'metal',
    description: 'James Hetfield\'s iconic intro uses open-string arpeggiated chords. Excellent for right-hand independence and clean tone work.',
  },
  {
    id: 'song-012',
    title: 'Blackbird',
    artist: 'The Beatles',
    techniques: ['chords', 'fingerpicking'],
    difficulty: 'intermediate',
    genre: 'folk',
    description: 'Paul McCartney\'s two-finger picking pattern over moving chords. A landmark piece for developing thumb-and-finger independence.',
  },
  {
    id: 'song-013',
    title: 'Wonderwall',
    artist: 'Oasis',
    techniques: ['chords', 'rhythm'],
    difficulty: 'beginner',
    genre: 'rock',
    description: 'Capo-2 chord shapes with a distinctive strumming pattern. A strong foundation exercise for chord transitions and strumming.',
  },

  // ── LEGATO ───────────────────────────────────────────────────────────────────
  {
    id: 'song-014',
    title: 'For the Love of God',
    artist: 'Steve Vai',
    techniques: ['legato', 'scales'],
    difficulty: 'advanced',
    genre: 'rock',
    description: 'Vai\'s most expressive solo — long flowing legato lines with whammy. Challenges your left-hand stamina and musical phrasing.',
  },
  {
    id: 'song-015',
    title: 'Cliffs of Dover',
    artist: 'Eric Johnson',
    techniques: ['legato', 'picking', 'scales'],
    difficulty: 'advanced',
    genre: 'rock',
    description: 'Eric Johnson\'s signature blend of fast legato and crisp picking. Focuses on tone, note clarity, and seamless technique transitions.',
  },
  {
    id: 'song-016',
    title: 'Satch Boogie',
    artist: 'Joe Satriani',
    techniques: ['legato', 'picking', 'scales'],
    difficulty: 'advanced',
    genre: 'rock',
    description: 'Satriani combines chunky rhythm riffs with fast legato runs. Great for working on technique transitions at tempo.',
  },
  {
    id: 'song-017',
    title: 'Tender Surrender',
    artist: 'Steve Vai',
    techniques: ['legato', 'scales'],
    difficulty: 'intermediate',
    genre: 'rock',
    description: 'Melodic and lyrical legato throughout. Less about speed and more about tone and emotional expression — a great legato study.',
  },

  // ── PICKING ───────────────────────────────────────────────────────────────────
  {
    id: 'song-018',
    title: 'Tornado of Souls – Solo',
    artist: 'Megadeth',
    techniques: ['picking', 'scales'],
    difficulty: 'advanced',
    genre: 'metal',
    description: 'Marty Friedman\'s exotic-scale solo is an alternate picking masterclass. Includes outside bends and a highly personalized technique.',
  },
  {
    id: 'song-019',
    title: 'Master of Puppets – Riff',
    artist: 'Metallica',
    techniques: ['picking', 'rhythm'],
    difficulty: 'intermediate',
    genre: 'metal',
    description: 'Downpicked at ~212 BPM. The gold standard for building right-hand picking endurance and precision in metal rhythm guitar.',
  },
  {
    id: 'song-020',
    title: 'Afterlife – Intro Riff',
    artist: 'Avenged Sevenfold',
    techniques: ['picking', 'scales'],
    difficulty: 'intermediate',
    genre: 'metal',
    description: 'Fast alternate-picked single-note riff that works through a scale pattern. Excellent for building picking speed and accuracy.',
  },

  // ── FINGERPICKING ─────────────────────────────────────────────────────────────
  {
    id: 'song-021',
    title: 'Dust in the Wind',
    artist: 'Kansas',
    techniques: ['fingerpicking'],
    difficulty: 'beginner',
    genre: 'folk',
    description: 'Classic Travis-style fingerpicking through Am–G–F. The perfect first fingerpicking song — slow, consistent pattern throughout.',
  },
  {
    id: 'song-022',
    title: 'Classical Gas',
    artist: 'Mason Williams',
    techniques: ['fingerpicking', 'arpeggios'],
    difficulty: 'intermediate',
    genre: 'classical',
    description: 'Flowing arpeggios across a rich chord progression. Great for developing speed and evenness in all five right-hand fingers.',
  },
  {
    id: 'song-023',
    title: 'Tears in Heaven',
    artist: 'Eric Clapton',
    techniques: ['fingerpicking', 'chords'],
    difficulty: 'beginner',
    genre: 'pop',
    description: 'Gentle fingerpicking with moving chord shapes. Focuses on thumb-bass alternation and clean melody note separation.',
  },

  // ── RHYTHM ───────────────────────────────────────────────────────────────────
  {
    id: 'song-024',
    title: 'Back in Black – Riff',
    artist: 'AC/DC',
    techniques: ['rhythm', 'picking'],
    difficulty: 'beginner',
    genre: 'rock',
    description: 'Malcolm Young\'s immortal rhythm riff. The best rock rhythm exercise — focus on muting, groove, and right-hand consistency.',
  },
  {
    id: 'song-025',
    title: 'Enter Sandman – Riff',
    artist: 'Metallica',
    techniques: ['rhythm', 'picking'],
    difficulty: 'beginner',
    genre: 'metal',
    description: 'Heavy palm-muted downpicking with open-string patterns. Essential for learning metal rhythm guitar fundamentals.',
  },
  {
    id: 'song-026',
    title: 'Killing in the Name – Riff',
    artist: 'Rage Against the Machine',
    techniques: ['rhythm'],
    difficulty: 'beginner',
    genre: 'metal',
    description: 'Tom Morello\'s deceptively simple open-E riff with aggressive muting. Focuses on feel, aggression, and rhythmic precision.',
  },
  {
    id: 'song-027',
    title: 'Superstition – Intro Riff',
    artist: 'Stevie Wonder (adapted)',
    techniques: ['rhythm', 'theory'],
    difficulty: 'intermediate',
    genre: 'funk',
    description: 'Adapted to guitar, this funk riff is a masterclass in 16th-note groove. Challenges your sense of pocket and syncopation.',
  },

  // ── THEORY ───────────────────────────────────────────────────────────────────
  {
    id: 'song-028',
    title: 'Autumn Leaves',
    artist: 'Jazz Standard',
    techniques: ['theory', 'chords', 'scales'],
    difficulty: 'intermediate',
    genre: 'jazz',
    description: 'The quintessential ii-V-I jazz standard. An essential vehicle for applying music theory, chord-scale relationships, and improvisation.',
  },
  {
    id: 'song-029',
    title: 'Blue Bossa',
    artist: 'Jazz Standard',
    techniques: ['theory', 'chords'],
    difficulty: 'beginner',
    genre: 'jazz',
    description: 'A short bossa nova standard with a key change. Great for learning how chords function harmonically and how to comp over changes.',
  },
]

export const DIFFICULTY_COLORS = {
  beginner: 'bg-green-900 text-green-300',
  intermediate: 'bg-yellow-900 text-yellow-300',
  advanced: 'bg-red-900 text-red-300',
}

export const GENRE_ICONS = {
  rock: '🎸',
  metal: '🤘',
  folk: '🪕',
  jazz: '🎷',
  classical: '🎼',
  funk: '🕺',
  pop: '🎵',
}

/**
 * Given a set of technique names, return scored and sorted song suggestions.
 * Songs with more matching techniques score higher.
 */
export function getSuggestedSongs(techniques, limit = 6) {
  if (!techniques.length) return []
  const techSet = new Set(techniques)

  return SONG_LIBRARY
    .map((song) => ({
      ...song,
      matchCount: song.techniques.filter((t) => techSet.has(t)).length,
    }))
    .filter((s) => s.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || a.difficulty.localeCompare(b.difficulty))
    .slice(0, limit)
}
