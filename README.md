# Guitar Trainer

A personal guitar practice app with an AI coach, Web Audio metronome, performance listening, Spotify integration, and a song repertoire tracker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand with `persist` middleware → localStorage |
| Backend | Express.js (API proxy only) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) via Express proxy |
| Audio | Web Audio API (metronome + microphone analysis) |
| Auth | Spotify PKCE OAuth (no backend secret required) |

---

## Project Structure

```
trainer/
├── server.js                        # Express proxy for Anthropic API
├── vite.config.js                   # Vite config — host 127.0.0.1, proxy /api → :3001
├── src/
│   ├── App.jsx                      # View router (builder | practice | repertoire | coach)
│   ├── main.jsx
│   ├── index.css                    # Tailwind base + custom component classes
│   ├── spotify.js                   # Spotify PKCE OAuth + API helpers
│   ├── data/
│   │   ├── exercises.js             # 38 default exercises across 11 technique categories
│   │   └── songs.js                 # 29 curated songs with technique + genre tags
│   ├── store/
│   │   └── index.js                 # Zustand store (exercises, session, history, repertoire, spotify)
│   ├── hooks/
│   │   ├── useMetronome.js          # Web Audio lookahead scheduler
│   │   └── useAudioAnalyzer.js      # Mic input, pitch detection, onset detection, timing score
│   └── components/
│       ├── Layout.jsx               # Header + nav tabs
│       ├── SpotifyCallback.jsx      # OAuth redirect handler
│       ├── SessionBuilder/
│       │   ├── index.jsx            # Library (left) + session panel + song suggestions (right)
│       │   ├── ExerciseCard.jsx     # Collapsible exercise card with add-to-session
│       │   ├── AddExerciseModal.jsx # Form modal for custom exercises
│       │   └── SongSuggestions.jsx  # Spotify connect UI + personalized song suggestions
│       ├── Practice/
│       │   ├── index.jsx            # Metronome UI + BPM controls + session progress
│       │   └── PerformanceListener.jsx  # Mic listener UI — volume, pitch, timing score
│       ├── Repertoire/
│       │   └── index.jsx            # Song log, due-for-review reminders, what-to-learn suggestions
│       └── Coach/
│           └── index.jsx            # Claude chat with tool-use loop
```

---

## Setup

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- A [Spotify Developer app](https://developer.spotify.com/dashboard) (optional, for personalized suggestions)

### Install & run

```bash
git clone https://github.com/Hernanros/guitar-trainer.git
cd guitar-trainer
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

Opens at `http://127.0.0.1:5173` (must use `127.0.0.1`, not `localhost` — required for Spotify OAuth).

### Environment variables

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001          # optional, defaults to 3001
```

---

## Architecture Notes

### Metronome (`useMetronome.js`)
Uses Web Audio API with a 25ms lookahead scheduler and 100ms schedule-ahead window for sample-accurate timing. Oscillator clicks: 1000 Hz accent on beat 1, 800 Hz on off-beats. BPM changes take effect via ref without re-rendering.

### Audio Analyzer (`useAudioAnalyzer.js`)
- **Pitch detection**: autocorrelation on `Float32Array` from `AnalyserNode` (fftSize 2048). Reliable for single-note guitar input.
- **Onset detection**: RMS energy threshold (0.015) with 80ms cooldown between onsets.
- **Timing score**: each onset is matched to the nearest metronome beat timestamp; onsets within ±100ms count as "in time". Score = `inTime / totalOnsets * 100`.
- **Device selection**: calls `enumerateDevices()` on mount and again after `getUserMedia` (labels only appear after permission is granted).

### Claude API proxy (`server.js`)
- `POST /api/chat` forwards `{ model, messages, tools, system }` to the Anthropic SDK.
- The API key never leaves the server.
- The client handles the full tool-use loop: if `stop_reason === 'tool_use'`, it executes the tool locally (mutates Zustand store) and sends a `tool_result` turn, repeating until `stop_reason === 'end_turn'`.
- Max 8 iterations per turn to prevent infinite loops.

### Spotify OAuth (`spotify.js`)
PKCE flow — no client secret needed:
1. `startAuth(clientId)` generates a code verifier + SHA-256 challenge, stores verifier in `sessionStorage`, redirects to Spotify.
2. `SpotifyCallback.jsx` reads the `code` param, calls `exchangeCode()`, fetches top artists + top tracks (all 3 time ranges → up to 150 unique tracks), stores everything in Zustand.
3. `connected`, `topGenres`, `topTracks`, `topArtists`, `displayName` are persisted to localStorage. `accessToken` and `expiresAt` are in-memory only.

> **Important**: The app must be opened at `http://127.0.0.1:5173` (not `localhost:5173`). Both the Vite dev server and the Spotify dashboard redirect URI must use `127.0.0.1` or sessionStorage won't be accessible across the redirect.

### State (`store/index.js`)
Persisted to localStorage via Zustand `partialize`:
- `exerciseLibrary` — full library including custom exercises
- `currentSession` — ordered list of `{ exerciseId, sessionBpm }`
- `exerciseHistory` — per-exercise `{ sessions[], lastBpm, totalSessions }`
- `savedRoutines` — named session snapshots
- `songLog` — repertoire entries with status and practice history
- `spotify` — `connected`, `clientId`, `topGenres`, `topTracks`, `topArtists`, `displayName`

Not persisted: `coachDisplayMessages`, `coachApiMessages`, `accessToken`, `expiresAt`.

---

## Technique Categories

`scales` · `arpeggios` · `chords` · `legato` · `picking` · `fingerpicking` · `rhythm` · `theory` · `licks` · `slide` · `phrasing`

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite (port 5173) + Express (port 3001) via concurrently |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run server` | Express server only |
