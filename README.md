# Duple 💙

Your relationship sidekick. 100% local data, free forever.

Lightweight (11.6 MB .exe), data stays on your device.

## Why?

Ever forget their favorite food? Miss their cycle? Say the wrong thing when they're upset?

Duple helps you be a more thoughtful partner — track everything in one place.

## Features

- 🍕 **Food Favorites** — Log their favorite foods & drinks with ratings + mood tags
- 📋 **Food Log** — Daily log to track eating patterns
- 🩸 **Cycle Tracker** — Track & predict cycles, visual calendar, fertile window
- 😊 **Mood Tracker** — Log daily moods + triggers
- 💡 **Smart Recommendations** — "They're upset? Here's what to get + what to say"
- 📅 **Place Plans** — Wishlist of date spots + status tracker
- ❤️ **Special Moments** — Log anniversaries, dates, milestones + countdowns
- 🎁 **Gift Wishlist** — Track items they mention + size/brand preferences
- ⚡ **Trigger Words** — Words to avoid + safe alternatives
- 👥 **Important People** — Track their friends, family, coworkers

## Usage

### Desktop (.exe)

1. Download `Duple.exe` from [Releases](https://github.com/rinopatrick/duple/releases)
2. Double click → instant
3. Data stored via SQLite on your device

### Web Browser

1. Open [duple.vercel.app](https://duple.vercel.app)
2. Data stored in your browser (IndexedDB)
3. No data touches a server

### Cloud Sync (Coming Soon)

Optional: BYOD Supabase (free tier) to sync across devices. 3-step guide provided.

## Dev

```bash
git clone https://github.com/rinopatrick/duple
cd duple
npm install
npm run dev          # http://localhost:1420
npm run tauri build  # Build .exe (requires Rust + VS Build Tools)
```

Built with:
- 🦀 Tauri v2 — desktop wrapper
- ⚡ Svelte 5 + Vite — UI
- 🎨 TailwindCSS v4 — styling
- 📦 Dexie.js — IndexedDB (browser mode)
- 🗄️ SQLite — local DB (desktop mode)

## License

MIT
