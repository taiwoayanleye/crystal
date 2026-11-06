# Crystal — Data-as-a-Product Platform

A Next.js application demonstrating a **data-as-a-product** framework: quality signals, outcome tracking, AI-assisted insights, and source lineage for enterprise data teams.

**Live demo:** https://crystal-eight-omega.vercel.app

Crystal treats each dataset as a product with a hypothesis and measurable value, and scores it on three axes:

- **Quality** — freshness, completeness, accuracy
- **Usage** — adoption %, queries/day, unique users
- **Outcome** — is the hypothesis being validated, and what business value follows

It also ships a Claude-powered assistant for instant, context-aware insights, and an ETL lineage view for transparency.

> **Design inspiration:** Palantir Foundry — minimalist, enterprise-grade, outcome-focused.

---

## Features

### Homepage and dashboard
- `/` is the public homepage, with links to the project docs, GitHub, and dashboard plus a live portfolio snapshot.
- `/dashboard` is the portfolio dashboard, with searchable data-product cards showing quality estimates, illustrative demo activity, outcome status, and hypothesis.
- "Ask" opens the Claude assistant scoped to that dataset.

### Dataset detail
- Full quality breakdown (freshness, completeness, accuracy) with color-coded bars.
- Usage metrics + a 30-day trend chart.
- Outcome tracking (hypothesis → status → business impact → score).
- Observed data flow: Source → Ingestion → Profile → Data product. Intended audiences are shown separately from connected downstream systems.
- Delete action with inline confirm.

### Upload
- Drag-and-drop CSV upload with validation and loading states.
- Define the problem statement and the users/stakeholders.
- Quality metrics are computed from the real uploaded data.

### Claude assistant
- Context-aware answers grounded in the dataset's real metrics and sample rows.
- Starter prompts, streaming-style loading, and per-dataset message history.

---

## Tech stack

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS 3 with custom design tokens
- **Charts:** Recharts
- **AI:** Anthropic Claude API
- **Database:** Neon Postgres (serverless) via the Vercel Marketplace
- **Deployment:** Vercel

---

## Architecture

```
Browser (Next.js App Router, client components)
  │
  ├─ /api/datasets        GET   list datasets (+ summary metrics)
  ├─ /api/datasets/[id]   GET   detail (quality, usage, trend, lineage)
  │                       DELETE remove a dataset
  ├─ /api/upload          POST  parse CSV → compute quality → persist
  ├─ /api/connect         POST  connect to PostgreSQL → snapshot → persist
  ├─ /api/analyze         POST  analyze CSV columns/sample for upload suggestions
  └─ /api/chat            POST  dataset-grounded Claude insight
             │
             ▼
   src/lib/database.ts  ── async data layer (schema bootstrap + seed + CRUD)
   src/lib/db.ts        ── lazy Neon client (no-store fetch)
             │
             ▼
        Neon Postgres  (datasets table; JSONB for nested fields + sample rows)
```

Key design choices:

- **Deterministic metrics.** Usage and trend numbers are seeded from the dataset id, so the dashboard and detail view stay consistent across reloads.
- **Lazy DB client.** The Neon client initializes on first query (never at import), so `next build` succeeds before env vars exist.
- **No-store reads.** The Neon driver's `fetch` is set to `no-store` so reads aren't served stale from Next.js's fetch cache after writes.
- **Lean reads.** List/detail queries select explicit columns and exclude the heavy sample-rows JSONB.

---

## Getting started

### 1. Install
```bash
npm install
```

### 2. Environment
Copy the example and fill in the values:
```bash
cp .env.example .env.local
```
```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgres://...   # Neon (or any Postgres) connection string
```
On Vercel, these are provisioned automatically when you connect the Neon integration and set `ANTHROPIC_API_KEY` in project settings. Locally you can pull them with `vercel env pull .env.local`.

### 3. Run
```bash
npm run dev
```
Open http://localhost:3000 for the homepage, then choose **Open Dashboard** or visit http://localhost:3000/dashboard. On first request the app auto-creates its schema and seeds sample datasets.

### 4. Test
```bash
npm test
```

---

## Project structure

```
crystal/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Public homepage
│   │   ├── dashboard/page.tsx       # Portfolio dashboard
│   │   ├── detail/[id]/page.tsx     # Dataset detail
│   │   └── api/                     # upload · connect · analyze · datasets · chat
│   ├── components/                  # Header, Sidebar, MetricCard, ChatPanel, …
│   └── lib/
│       ├── db.ts                    # Neon client (lazy, no-store)
│       ├── database.ts              # schema bootstrap, seed, async CRUD
│       ├── csvParser.ts             # CSV parsing
│       ├── metrics.ts               # quality + deterministic usage/trend
│       └── types.ts
├── design/                          # pen.dev design + specs
└── ...
```

---

## API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/datasets` | GET | List datasets with summary metrics |
| `/api/datasets/[id]` | GET | Dataset detail (quality, usage, trend, lineage) |
| `/api/datasets/[id]` | DELETE | Remove a dataset |
| `/api/upload` | POST | Upload CSV → compute quality → persist |
| `/api/connect` | POST | Connect to PostgreSQL → snapshot → persist |
| `/api/analyze` | POST | Analyze CSV sample and suggest product details/success metrics |
| `/api/chat` | POST | Dataset-grounded Claude insight |

---

## Roadmap

- **Phase 1 — MVP (done):** CSV ingestion, quality/usage/outcome metrics, Claude chat, lineage, Neon persistence, deployed.
- **Phase 2 — Multi-source connectors:** PostgreSQL, Snowflake, BigQuery, cloud storage (S3/GCS), a unified ingestion layer.
- **Phase 3 — Scale:** SaaS API connectors (Stripe, Salesforce, HubSpot), a query editor, scheduled/incremental syncs, dbt integration, advanced multi-dataset chat.

---

## License

MIT — free to use and modify.
