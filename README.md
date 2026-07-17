# 🌌 Chimera — AI Evidence Intelligence Platform

Chimera is a premium, high-fidelity AI-powered SaaS platform designed for investigators and analysts. It processes unstructured evidence (transcripts, audio files, PDFs), resolves contradictions, constructs chronological event timelines, and maps relationships in a fully explainable, citation-grounded environment.

---

## 🌟 Key Features & Capabilities

### 1. Operations Command Center
A futuristic, unified hub for analyzing case intelligence.
*   **System Dashboard**: Get immediate insight into case summaries, data ingestion statistics, and critical system alerts.
*   **Multimodal Ingestion**: Upload scattered PDFs, transcripts, and audio recordings to instantly parse structured metadata.
*   **Lattice Node Graph**: Explore high-dimensional network maps showing semantic relationships between entities, people, locations, and contradictions.
*   **Synaptic Timeline**: View chronological visualizations of cross-document events automatically correlated in sequence.
*   **AI Transmission Chat**: Query your intelligence corpus with citation-grounded conversational answers mapping back to original sources.
*   **Contradiction Analyzer**: Cross-examine source testimonies to automatically flag conflicts, discrepancy rates, and timeline inconsistencies.
*   **Neural Analytics**: Visualize system token distributions, model confidence metrics, and processing logs.
*   **System Settings**: Configure profile preferences, model thresholds (`gemini-2.5-flash`), data residency, and security rules.

### 2. High-Fidelity Cinematic Interface
An interface designed to blend technical utility with stunning, premium aesthetics:
*   **3D Living Neural Core**: An interactive WebGL-rendered brain visualizer utilizing **Three.js** that responds dynamically to user states (idle, observing, excited).
*   **Interactive Parallax Canvas**: Drifting vector particles and custom-drawn glass bubbles with real-time mouse repulsion, click-ripple waves, and depth layers.
*   **Audio Telemetry Engine**: Ambient spatial drone/soundscapes and subtle UI interaction audios built natively with the **Web Audio API**.

---

## ⚡ Recent Integration & Progress Updates

We have completed the core security and navigation flows:
1.  **Stateful Mock Auth Simulation (`localhost`)**:
    *   Re-engineered the local mock authentication layer (`dummyAuth` Proxy in `client.ts`) to be fully stateful using `localStorage` token indicators.
    *   Supports full log in, sign up, and sign out processes locally without requiring live database credentials.
2.  **Dynamic Landing Page Redirection**:
    *   Subscribed the landing page state to `supabase.auth.onAuthStateChange`.
    *   The "Initialize" and "Dashboard" entry points now check the auth state dynamically:
        *   **Authenticated**: Directly launches the dashboard.
        *   **Logged Out**: Safely redirects the user to the `/auth` page.
3.  **Modernized Auth UI**:
    *   Removed the Google login option and divider to emphasize clean, localized credentials.
    *   Widened the login card dimensions (`max-w-[480px]`) and adjusted forms, text sizes, and paddings (`p-8`) for a more spacious, premium look.
4.  **Integrated Sign-Out Options**:
    *   Implemented a dropdown menu for the user card in the application sidebar, allowing clean user logout from anywhere.
    *   Added a secure **Sign out** trigger in the Profile tab of the Settings layout.

---

## 🛠️ Technology Stack

*   **Core**: React 19, TypeScript, Vite
*   **Routing**: TanStack Router (Start SSR built-in routing tree)
*   **Database / Auth Integration**: Supabase client (`@supabase/supabase-js`) & Lovable cloud API
*   **Aesthetics**: Tailwind CSS, Framer Motion, Lucide icons
*   **Graphics & Visuals**: Three.js (WebGL), HTML5 Canvas 2D
*   **State & Queries**: TanStack Query (`@tanstack/react-query`)

---

## 🚀 Local Setup & Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run in development mode**:
    ```bash
    npm run dev
    ```
    This launches the local development server (typically at `http://localhost:8080/` or `http://localhost:5173/`).
3.  **Build production version**:
    ```bash
    npm run build
    ```

---

*Note: Environment variables (`.env` files) and local configs/logs are strictly excluded from git tracking via `.gitignore` to prevent any credential leaks.*
