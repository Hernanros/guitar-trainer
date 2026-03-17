# Guitar Trainer — Project Rules

## Stack
Vite + React 18, Zustand (persist → localStorage), Tailwind CSS dark/orange theme,
Express backend (port 3001, proxied via Vite), Anthropic claude-sonnet-4-6.

## Running the app
```bash
npm run dev   # starts Vite (5173) + Express (3001) concurrently
```
Must open at http://127.0.0.1:5173 — not localhost. Required for Spotify OAuth
(sessionStorage PKCE verifier is origin-scoped).

## Architecture
- All state in src/store/index.js (Zustand). Check partialize before adding new fields.
- Claude API key never leaves server.js. All AI calls go through POST /api/chat.
- Spotify uses PKCE — no backend secret. Token is in-memory only (not persisted).
- Coach tool-use loop lives on the client (max 8 iterations). Tool executes locally,
  result sent back to API.

## Persisted state fields (partialize)
exerciseLibrary, currentSession, exerciseHistory, savedRoutines, songLog, tabLibrary,
spotify: { connected, clientId, topGenres, topArtists, topTracks, displayName }
NOT persisted: accessToken, expiresAt, coachDisplayMessages, coachApiMessages

## Before adding any new store field
1. Decide: does it survive page reload? → Add to partialize explicitly.
2. Define its shape and defaults in a comment next to the slice.
3. Handle missing field gracefully for old stored data (use ?? fallback).

## Technique categories
scales · arpeggios · chords · legato · picking · fingerpicking · rhythm · theory · licks · slide · phrasing

## Current views
builder → practice → repertoire → tabs → coach
SpotifyCallback is a separate route at /spotify-callback (not a view).

## Known constraints
- Spotify top tracks: fetched across 3 time ranges (short/medium/long), up to 150 unique.
- Audio analyzer: autocorrelation pitch detection, reliable for single notes only.
- Tab parser: section-based, detects tab/chord/text line types. Fragile on non-standard UG formats.
- Exercise history: keeps last 10 sessions per exercise.
- Level-up threshold: last 3 sessions ≥ 90% of targetBpm.
