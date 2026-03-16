# Guitar Trainer — User Guide

Your personal guitar practice companion. Build focused practice sessions, track your progress, get AI coaching, and keep a log of everything you're learning.

---

## Getting Started

1. Run `npm run dev` and open `http://127.0.0.1:5173` in your browser
2. The app comes pre-loaded with 38 exercises across 11 technique categories
3. Start in **Session Builder** to pick exercises for today's practice

---

## The Four Tabs

### 🎵 Session Builder

This is your starting point before every practice session.

**Building a session:**
- Browse exercises on the left, grouped by technique (scales, picking, chords, etc.)
- Click **+ Add** on any exercise to add it to your session on the right
- Adjust the starting BPM for each exercise in the session panel
- Drag the ▲▼ arrows to reorder exercises
- Hit **Start Practice →** when ready

**Custom exercises:**
- Click **+ New Exercise** at the top of the library
- Fill in the name, technique, BPM range, instructions, and tips
- Your custom exercises are saved permanently and marked with a badge

**Saving routines:**
- Build a session you like, type a name in the "Routine name" field, and click **Save**
- Load or delete saved routines from the **Saved Routines** panel

**Song suggestions:**
- The right column shows songs to practice that match the techniques in your current session
- Connect Spotify (see below) to see your own top tracks in a dedicated section
- Hit **↺ Reshuffle** to get a fresh random selection from your 150 top Spotify songs
- Click **▶ Lesson** on any song to open a YouTube guitar lesson search

---

### 🎸 Practice

**The metronome:**
- The 4-beat grid lights up as the metronome plays — beat 1 glows orange
- Adjust BPM with the slider, ±1/±5 buttons, or type directly in the number field
- Hit **▶ Start** to begin and **⏹ Stop** to pause

**Completing exercises:**
- Hit **Complete at [N] BPM** when you've practiced at your current tempo — this saves your progress
- The BPM progress bar shows where you are between your start and target BPM
- When you've hit the target BPM in 3 consecutive sessions, a "Ready to level up" toast appears
- **Skip** moves to the next exercise without saving

**Performance Listener:**
- Click **🎙 Listen** to activate the microphone
- The app scores your timing against the metronome: onsets within ±100ms of a beat count as "in time"
- After stopping, you'll see your timing score %, notes detected, and a tip
- Click **Send to Coach for Detailed Feedback** to automatically send your stats to the AI Coach

**Audio interface / microphone selection:**
- If you have multiple inputs (e.g. a Focusrite Scarlett), a dropdown appears above the Listen button
- Select your interface before clicking Listen

---

### 🎼 Repertoire

Track every song you want to learn, are learning, or can already play.

**Adding songs:**
- Click **+ Add Song** and fill in the title, artist, and starting status
- Or click **+ Add** directly from the "What to learn next" suggestions

**Song status workflow:**
- **Want to learn** → **Learning** → **Can play**
- Click the status badge on any song to advance it to the next stage

**Logging practice:**
- Hit **✓ Practiced today** after working on a song — the app tracks your streak and last practice date

**Due for review reminders:**
- Songs you're *Learning* that you haven't touched in 7+ days get flagged ⏰
- Songs you *Can play* that haven't been practiced in 21+ days get flagged too
- A yellow badge on the Repertoire tab tells you how many are overdue
- Filter to just due songs by clicking the yellow callout banner

**Notes:**
- Click **+ Note** on any song to add reminders, problem spots, or things to work on
- Click the note text to edit it

**Related exercises:**
- Songs tagged with techniques show linked exercises from your library
- Click any exercise badge to add it straight to your current session

**What to learn next:**
- Shows unlearned songs from your Spotify top tracks (shuffleable)
- Shows curated suggestions matched to the techniques you've been practicing
- Hit **↺ Reshuffle** to get a new random selection from your full Spotify library

---

### 🤖 AI Coach

Chat with an AI guitar coach powered by Claude.

**What it can do:**
- Analyze your performance stats (sent automatically from the Practice tab)
- Suggest exercises tailored to your weak spots
- Create brand-new exercises and add them directly to your library
- Answer technique questions, explain theory, give practice advice

**Creating exercises via chat:**
- Describe what you want: *"Give me a funk strumming exercise at 90 BPM"*
- The coach writes the exercise and adds it to your library automatically
- A card appears in the chat with the exercise details and an **+ Add to session** button

**Tips:**
- The coach knows your full exercise library and recent practice history
- Be specific: mention the technique, your current BPM, and what's giving you trouble
- The chat persists when you switch tabs — come back any time

---

## Spotify Integration

Connect Spotify to personalize your song suggestions with music you actually listen to.

**Setup (one time):**
1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create an app (any name)
3. In the app settings, add this Redirect URI: `http://127.0.0.1:5173/spotify-callback`
4. Copy your **Client ID**
5. In the app, go to Session Builder → Song Suggestions → paste your Client ID → click **🎵 Connect**
6. Log in to Spotify and approve access

**What it does:**
- Fetches your top 150 songs across short, medium, and long listening history
- Shows them in a "Your top songs to learn" section with YouTube lesson links
- Uses your top genres to boost relevant songs in the curated suggestions
- Everything is stored locally — no data is sent anywhere except Spotify's own servers

**Troubleshooting:**
- Must use `http://127.0.0.1:5173` — not `localhost:5173` — or the login won't complete
- If you see an error after login, check that the Redirect URI in your Spotify dashboard exactly matches `http://127.0.0.1:5173/spotify-callback`
- If the token expires, a **Reconnect** button appears — click it to refresh

---

## BPM Progression System

- Each time you complete an exercise, your BPM is saved to your history
- The progress bar in Practice shows your journey from start BPM to target BPM
- When your last 3 sessions all hit ≥ 90% of the target BPM, you get a "Ready to level up!" notification
- Use this as the signal to raise your practice BPM by 5–10

---

## Tips for Effective Practice

- **Start slow** — accuracy at a lower BPM is worth more than sloppy speed
- **Use the Performance Listener** — the timing score shows you honestly how locked-in you are
- **Send stats to the Coach** after a hard session — it gives targeted advice based on actual data
- **Keep your Repertoire up to date** — logging practice builds good habits and the reminders catch songs that are getting rusty
- **Build focused sessions** — 3–4 exercises with a clear technique goal beats a scattered 10-exercise list
