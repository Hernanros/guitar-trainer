// Spotify PKCE OAuth utilities + API helpers

export const REDIRECT_URI = 'http://127.0.0.1:5173/spotify-callback'
const AUTH_URL = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SCOPES = 'user-top-read'

// ── PKCE helpers ─────────────────────────────────────────────────────────────

function randomBytes(length) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return array
}

function base64urlEncode(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateVerifier() {
  return base64urlEncode(randomBytes(64))
}

async function generateChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64urlEncode(hash)
}

// ── Auth flow ─────────────────────────────────────────────────────────────────

export async function startAuth(clientId) {
  const verifier = generateVerifier()
  const challenge = await generateChallenge(verifier)
  const state = base64urlEncode(randomBytes(16))

  sessionStorage.setItem('spotify_verifier', verifier)
  sessionStorage.setItem('spotify_state', state)
  sessionStorage.setItem('spotify_client_id', clientId)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
    state,
  })

  window.location.href = `${AUTH_URL}?${params}`
}

export async function exchangeCode(code, returnedState) {
  const verifier = sessionStorage.getItem('spotify_verifier')
  const expectedState = sessionStorage.getItem('spotify_state')
  const clientId = sessionStorage.getItem('spotify_client_id')

  if (!verifier || !clientId) throw new Error('Missing PKCE verifier — please try connecting again.')
  if (returnedState !== expectedState) throw new Error('State mismatch — possible CSRF attempt.')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId,
    code_verifier: verifier,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error_description || `Token exchange failed (${res.status})`)
  }

  sessionStorage.removeItem('spotify_verifier')
  sessionStorage.removeItem('spotify_state')
  sessionStorage.removeItem('spotify_client_id')

  return res.json() // { access_token, token_type, expires_in, refresh_token, scope }
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function spotifyGet(path, token) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('TOKEN_EXPIRED')
  if (!res.ok) throw new Error(`Spotify API error ${res.status}`)
  return res.json()
}

export async function fetchTopArtists(token) {
  const data = await spotifyGet('/me/top/artists?limit=20&time_range=medium_term', token)
  return data.items ?? [] // array of artist objects with .name and .genres[]
}

export async function fetchProfile(token) {
  return spotifyGet('/me', token)
}

// ── Genre mapping ─────────────────────────────────────────────────────────────
// Maps Spotify's freeform genre strings to our song library genre tags

const GENRE_KEYWORDS = {
  metal:     ['metal', 'thrash', 'death', 'doom', 'black metal', 'power metal', 'heavy', 'hardcore', 'metalcore', 'deathcore', 'sludge', 'stoner', 'progressive metal', 'djent', 'nu metal', 'speed metal'],
  rock:      ['rock', 'punk', 'grunge', 'alternative', 'indie rock', 'hard rock', 'classic rock', 'post-rock', 'psychedelic', 'garage', 'shoegaze', 'emo', 'post-punk', 'new wave', 'britpop', 'southern rock', 'blues rock'],
  jazz:      ['jazz', 'bebop', 'bossa', 'fusion', 'swing', 'blues', 'latin jazz', 'smooth jazz', 'contemporary jazz', 'big band', 'cool jazz', 'free jazz'],
  folk:      ['folk', 'country', 'acoustic', 'singer-songwriter', 'americana', 'bluegrass', 'celtic', 'traditional', 'indie folk', 'folk rock', 'neo-folk', 'world music'],
  classical: ['classical', 'baroque', 'orchestral', 'neoclassical', 'neo-classical', 'chamber', 'opera', 'symphonic', 'minimalist', 'contemporary classical', 'piano'],
  funk:      ['funk', 'soul', 'r&b', 'groove', 'disco', 'motown', 'neo soul', 'contemporary r&b', 'rnb', 'afrobeat', 'new jack swing', 'urban', 'rhythm and blues'],
  pop:       ['pop', 'dance', 'electropop', 'synth', 'k-pop', 'indie pop', 'dream pop', 'art pop', 'bubblegum', 'teen pop', 'adult contemporary', 'easy listening'],
}

export function extractOurGenres(spotifyGenres) {
  const counts = {}
  for (const raw of spotifyGenres) {
    if (!raw || typeof raw !== 'string') continue
    const g = raw.toLowerCase()
    for (const [ours, keywords] of Object.entries(GENRE_KEYWORDS)) {
      if (keywords.some((kw) => g.includes(kw))) {
        counts[ours] = (counts[ours] || 0) + 1
      }
    }
  }
  // Return genres sorted by frequency
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)
}
