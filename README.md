![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

<p align="center">
  <img src="https://raw.githubusercontent.com/rinopatrick/duple/master/public/favicon.svg" width="80" alt="Duple" />
</p>

<h1 align="center">Duple 💙</h1>
<p align="center"><strong>Your relationship sidekick</strong> — track, remember, and care better.</p>

<p align="center">
  <a href="https://tryduple.vercel.app"><img src="https://img.shields.io/badge/demo-tryduple.vercel.app-6366f1?style=flat-square" /></a>
  <a href="https://github.com/rinopatrick/duple/releases"><img src="https://img.shields.io/badge/download-.exe_|_.dmg_|_.AppImage-22c55e?style=flat-square" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" /></a>
  <img src="https://img.shields.io/badge/tests-12_passed-22c55e?style=flat-square" />
</p>

---

## What is Duple?

Duple is an **open-source, local-first relationship management app**. It remembers everything about your partner so you don't have to — food favorites, cycle predictions, mood patterns, gift wishlists, trigger words to avoid — and gives personalized AI advice using your own data as context.

**100% private.** All data stays on your device. No accounts, no servers, no tracking.

## Features

| Category | Features |
|----------|----------|
| 🍕 **Food** | Favorite foods & drinks, meal log with mood tracking |
| 🩸 **Cycle** | Menstrual cycle tracker, PMS prediction, flow log |
| 😊 **Mood** | Daily mood tracker, trigger identification |
| 🎲 **Date Generator** | Random date ideas from food + place combos |
| 📅 **Places** | Saved locations with Google Maps links, status tracking |
| ❤️ **Moments** | Anniversary countdowns, special dates |
| 🎁 **Wishlist** | Gift wishlist + partner size measurements |
| ⚡ **Trigger Words** | Words to avoid when they're upset + safe alternatives |
| 🛡️ **Apology Playbook** | Situation-based do's & don'ts |
| 👥 **People** | Their friends, family, coworkers you should remember |
| 📊 **Stats** | Mood timeline, food categories, cycle patterns (4 chart types) |
| 🩺 **Health Check** | Weekly relationship health quiz with trend tracking |
| 🤖 **AI Advisor** | 6 LLM providers (OpenAI, Claude, Google, Groq, OpenRouter, Ollama) with RAG context |
| 🌐 **Multi-language** | English, Indonesian, Spanish, French, Portuguese, Japanese |
| ☁️ **Cloud Sync** | BYOD Supabase sync + OAuth login |
| 🔐 **App Lock** | PIN protection for sensitive data |
| 📦 **Backup** | Export/Import all data as JSON |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Svelte 5 (runes mode) |
| Styling | TailwindCSS v4 |
| Desktop | Tauri v2 (Rust) |
| Charts | Chart.js |
| Database (browser) | Dexie.js / IndexedDB |
| Database (desktop) | SQLite via Tauri plugin |
| Icons | Lucide |
| AI | 6 providers via fetch API |
| Cloud | Supabase BYOD |

## Quick Start

```bash
# Clone
git clone https://github.com/rinopatrick/duple.git
cd duple

# Install
npm install

# Dev server
npm run dev        # → http://localhost:1420

# Build
npm run build

# Preview
npm run preview    # → http://localhost:4173

# Test
npm test           # 12 tests
```

## Desktop Build

```bash
# Requires Rust toolchain: https://rustup.rs
cd src-tauri
cargo tauri build

# Output:
#   Windows: src-tauri/target/release/duple.exe
#   macOS:   src-tauri/target/release/bundle/dmg/Duple_*.dmg
#   Linux:   src-tauri/target/release/bundle/appimage/duple_*.AppImage
```

| OS | Status | Format |
|----|--------|--------|
| Windows | ✅ | `.exe` / `.msi` |
| macOS | ✅ | `.dmg` |
| Linux | ✅ | `.AppImage` / `.deb` |

*Cross-compilation not supported — build on each platform. CI builds available via GitHub Actions.*

## Architecture

```
duple/
├── src/
│   ├── lib/
│   │   ├── components/   # Shared UI (Sidebar, TopBar, PinGuard...)
│   │   ├── db/           # Database abstraction (Dexie + SQLite)
│   │   ├── engine/       # Business logic (recommendations, reminders)
│   │   ├── i18n/         # 6-language translations (700-line file)
│   │   ├── stores/       # Svelte 5 reactive stores
│   │   └── sync/         # Supabase cloud sync
│   ├── pages/            # 18+ page components (lazy-loaded)
│   └── __tests__/        # Vitest unit tests (12)
├── src-tauri/            # Tauri v2 (Rust) desktop wrapper
├── dist/                 # Build output
└── .github/workflows/    # CI/CD pipeline
```

## Donate

Duple is free and open source forever. If you find it useful:

- ⭐ Star this repo
- ☕ [Ko-fi](https://ko-fi.com/rinopatrick)
- 💰 [Saweria](https://saweria.co/rinopatrick)
- 🔗 Share with someone who needs it

## Privacy

Duple stores all data **locally on your device**. When using Supabase sync, you connect to **your own** Supabase project — we never see your data.

## License

MIT © 2025 [rinopatrick](https://github.com/rinopatrick)

## Production-readiness status

Current state: **engineering sample / pre-production**.

Recommended next steps:
1. Add CI checks (tests + lint) on every push/PR
2. Add release/versioning policy
3. Add deployment/runtime hardening docs
4. Add monitoring and operational runbook
