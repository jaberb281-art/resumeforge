# ResumeForge

An AI-powered resume builder that lets you create, edit, and tailor resumes to job descriptions — with a live PDF preview and one-click export.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-auth%20%2B%20db-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## Features

- **Live PDF preview** — see your resume update in real time as you type
- **AI tailoring** — paste a job description and let Gemini rewrite your bullets, adjust skills, and score your match
- **Multiple templates** — Professional, Creative, and Academic layouts
- **Theme presets** — switch fonts and color schemes instantly
- **Auto-save** — changes sync to the database as you edit
- **Magic link auth** — passwordless sign-in via Supabase

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand + Immer |
| PDF | @react-pdf/renderer |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (magic link / OTP) |
| AI | Google Gemini (`@google/generative-ai`) |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/resumeforge.git
cd resumeforge
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → Legacy anon key |
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

### 3. Run the database migration

In your Supabase dashboard, go to **SQL Editor → New query**, paste the contents of `supabase/migrations/0001_initial_schema.sql`, and click **Run**.

This creates three tables: `resumes`, `plan_limits`, and `ai_tailor_logs`, all with Row Level Security enabled.

### 4. Configure Supabase Auth

In **Supabase → Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** `http://localhost:3000/auth/callback`

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in [vercel.com](https://vercel.com)
2. Add the three environment variables in **Vercel → Settings → Environment Variables**
3. Deploy

Then update Supabase Auth URLs to your production domain:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/auth/callback` and `https://*.vercel.app/auth/callback`

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Dashboard
│   ├── login/page.tsx                  # Magic link login
│   ├── editor/[id]/page.tsx            # Resume editor
│   ├── auth/callback/route.ts          # Auth callback (PKCE exchange)
│   ├── _actions/create-resume.ts       # Server action — create resume
│   └── api/
│       ├── resumes/                    # CRUD routes
│       └── cv/tailor/                  # AI tailoring endpoint
├── components/
│   └── pdf/templates/
│       └── ProfessionalTemplate.tsx    # react-pdf resume templates
├── store/
│   └── useResumeStore.ts               # Zustand store (resume data + theme)
└── lib/
    └── supabase/
        ├── client.ts                   # Browser Supabase client
        └── server.ts                   # Server Supabase client
```

---

## Database Schema

### `resumes`
Stores resume content and theme config per user. Full RLS — users can only access their own rows.

### `plan_limits`
One row per user, created automatically on signup. Tracks subscription tier and AI usage limits. Written by Stripe webhook (service role only).

### `ai_tailor_logs`
Append-only log of AI tailoring calls. Used for rate limiting and usage display.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for AI tailoring |

---

## License

MIT