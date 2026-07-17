# 🧬 Chimera — AI Evidence Intelligence Platform

<div align="center">

**Next-generation AI-powered investigation platform for evidence analysis, contradiction detection, and case intelligence.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 🚀 What is Chimera?

**Chimera** is an AI Evidence Intelligence Platform designed for investigators, journalists, legal professionals, and analysts. It transforms raw, chaotic evidence — documents, images, transcripts, timelines — into structured, queryable intelligence through AI-powered synthesis.

---

## ✨ Features Implemented (Current Build)

### 🎨 Landing Page
- **Immersive 3D Neural Core** — Three.js animated neural sphere with orbital nodes and connections
- **Interactive Canvas Background** — Parallax bubble system with mouse-reactive physics and click ripples
- **Cinematic Boot Sequence** — Multi-stage animated initialization with glitch effects
- **Web Audio Engine** — Atmospheric neural drone hum with click/spark sound feedback
- **Sci-Fi Navigation** — Access-gated routing with animated lock alerts
- **"Path to Emergence" Section** — Phase cards with custom AI-generated imagery (local assets)
- **Synthesis Pipeline Animation** — Canvas-based flowing particle pipeline visualization
- **Glass Morphism Cards** — 3D tilt effect on hover with pink glow shadows

### 🔐 Authentication
- **Supabase Auth integration** — Email/password sign in and account creation
- **Local dummy auth mode** — Full stateful mock auth on `localhost` (no Supabase keys needed for dev)
- **Animated bubble background** — Mouse repulsion physics on the login page
- **Auth state routing** — Smart redirects based on auth state
- **Sign-out** support from the sidebar

### 📊 Dashboard
- **Real-time metrics cards** — Case counts, evidence stats, threat levels with pink glow styling
- **Quick action panel** — Fast access to all platform modules
- **Recent activity feed** — Live-style investigation event log

### 🗃️ Evidence Module
- Evidence listing page with filters and search
- Individual evidence detail view with AI analysis pane
- Evidence ingestion upload interface

### 💬 AI Chat
- Conversational AI evidence analysis interface

### 🕸️ Graph Visualization
- Lattice node graph for entity relationship mapping

### 📅 Timeline
- Chronological event viewer for cross-source correlation

### ⚡ Contradictions
- Contradiction detection view for conflicting evidence claims

### 📈 Analytics
- Investigation analytics dashboard with charts and metrics

### ⚙️ Settings
- User settings and profile configuration panel

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 8 |
| **Routing** | TanStack Router (file-based) |
| **Styling** | TailwindCSS v4 |
| **3D Graphics** | Three.js |
| **Auth / DB** | Supabase |
| **UI Components** | Radix UI (shadcn/ui) |
| **Notifications** | Sonner |
| **Icons** | Lucide React + Material Symbols |
| **Deployment** | Cloudflare Workers (Wrangler) |

---

## 🏗️ Project Structure

```
chimera/
├── public/
│   ├── favicon.png
│   ├── phase01.png             # AI-generated Phase 01 card image
│   ├── phase02.png             # AI-generated Phase 02 card image
│   └── phase03.png             # AI-generated Phase 03 card image
│
├── src/
│   ├── components/
│   │   ├── chimera/            # App-specific components (sidebar, topbar)
│   │   └── ui/                 # shadcn/ui base components
│   ├── integrations/
│   │   ├── supabase/           # Supabase client + types + dummy auth
│   │   └── lovable/            # OAuth helpers
│   ├── routes/
│   │   ├── index.tsx                       # Landing page
│   │   ├── auth.tsx                        # Login / Register
│   │   ├── __root.tsx                      # Root layout
│   │   ├── _authenticated.tsx              # Auth-gated layout
│   │   ├── _authenticated.dashboard.tsx
│   │   ├── _authenticated.evidence.*.tsx
│   │   ├── _authenticated.chat.tsx
│   │   ├── _authenticated.graph.tsx
│   │   ├── _authenticated.timeline.tsx
│   │   ├── _authenticated.contradictions.tsx
│   │   ├── _authenticated.analytics.tsx
│   │   ├── _authenticated.reports.tsx
│   │   ├── _authenticated.cases.tsx
│   │   └── _authenticated.settings.tsx
│   ├── styles.css              # Global styles + TailwindCSS v4 config
│   └── router.tsx
│
├── supabase/                   # Supabase migrations & config
├── vite.config.ts
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### 1. Clone the repository

```bash
git clone https://github.com/OmkarBiradarpatil/Chimera_Project.git
cd Chimera_Project
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Environment Variables

Create a `.env` file in the root directory (**never commit this file**):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

> 💡 **Running locally without Supabase?** The app auto-enables **dummy auth mode** on `localhost`. Sign in with any email/password — the full auth flow works with no Supabase config needed.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Production only | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Production only | Your Supabase anon/publishable key |

> ⚠️ **Security note:** Never commit `.env` files. The `.gitignore` covers all `.env.*` variants.

---

## 🚀 Deployment

### Cloudflare Workers

```bash
npm run deploy
```

### Vercel / Netlify

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables and deploy from `main`.

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Primary | `#8b5cf6` (violet) | Buttons, primary accents |
| Secondary | `#06b6d4` (cyan) | Data elements, highlights |
| Tertiary | `#fbabff` (pink) | Emphasis, glow effects |
| Background | `#111319` | Deep space dark |

---

## 🗺️ Roadmap

- [ ] Real Supabase DB integration for evidence storage
- [ ] File upload pipeline (PDFs, images, audio)
- [ ] OpenAI / Gemini API for AI chat responses
- [ ] Real-time collaboration (multi-user case rooms)
- [ ] Graph database integration (Neo4j) for entity relationships
- [ ] PDF/DOCX report export
- [ ] Role-based access control (admin, analyst, viewer)
- [ ] Mobile app (React Native)

---

## ⚠️ Security

- All secrets via environment variables only — no hardcoded credentials
- `.env` files are gitignored — all `.env.*` variants covered
- Local dummy auth is **only active on localhost**, never in production

---

## 📄 License

Demonstration / hackathon project. Do not use with real PII data.

---

<div align="center">
  <strong>Built with 🔮 by Omkar Biradar Patil</strong><br/>
  <em>Chimera — Where raw evidence becomes structured intelligence</em>
</div>
