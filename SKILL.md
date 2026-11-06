# Crystal — Data-as-a-Product Dashboard Build Guide

**Product Name:** Crystal  
**Target:** a Product Owner - Digital Enablement role  
**Timeline:** 5 days (Tue-Sat)  
**Status:** Scaffolding phase

---

## Overview

This skill provides end-to-end guidance for building a portfolio product that demonstrates understanding of the data-as-a-product framework (directly aligned with the target company's job description).

**Key Deliverables:**
- React dashboard for measuring data product outcomes
- Python backend with CSV data ingestion
- Claude API integration for AI-powered data insights
- Deployed to Vercel with GitHub documentation
- Cover letter + outreach to a hiring contact

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  - Dashboard UI                         │
│  - Dataset cards (quality, usage, outcomes)
│  - Chat panel                           │
│  - Lineage visualization                │
└──────────────┬──────────────────────────┘
               │ (API calls)
        ┌──────┴──────┐
        │             │
┌───────▼────────┐   │
│ Backend API    │   │
│ (Node.js +     │   │
│  Express)      │   │
└───────┬────────┘   │
        │            │
        │    ┌───────┴──────────┐
        │    │                  │
┌──────▼──┐  │  ┌─────────────┐ │
│SQLite   │  │  │ Claude API  │ │
│Database │  │  │ (Chat)      │ │
└─────────┘  │  └─────────────┘ │
             └──────────────────┘
```

---

## Build Phases

### Phase 1: Backend Scaffolding (1-2 days)
**Tech:** Node.js + Express + SQLite  
**Scope:**
- [ ] Initialize Node project (`npm init`)
- [ ] Set up Express server
- [ ] CSV upload endpoint (`/api/upload`)
  - Accept file
  - Parse CSV (csv-parser library)
  - Auto-detect schema
  - Store in SQLite
- [ ] Data product CRUD endpoints
  - `POST /api/products` - Create product with metadata
  - `GET /api/products` - List all products
  - `GET /api/products/:id` - Get one product + data context
- [ ] Environment setup (`.env`, `.gitignore`)

**Key Files:**
```
backend/
├── server.js           # Express setup
├── routes/upload.js    # CSV upload handler
├── routes/products.js  # Product CRUD
├── db/schema.sql       # SQLite schema
├── .env                # Config
└── package.json
```

### Phase 2: Frontend UI (1.5 days)
**Tech:** React + Vite + Tailwind + Recharts  
**Scope:**
- [ ] Create Vite + React project
- [ ] Layout components
  - Header (logo, nav)
  - Sidebar (product list)
  - Main dashboard area
- [ ] Product card component
  - Quality score (freshness %, completeness %, accuracy)
  - Usage metrics (queries/day, # users, adoption %)
  - Outcome score (0-5)
  - Trend chart (adoption over time)
- [ ] Data upload form
- [ ] Navigation between products

**Key Files:**
```
frontend/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── UploadForm.jsx
│   │   └── DashboardArea.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   └── ProductDetail.jsx
│   └── App.css
├── vite.config.js
└── package.json
```

### Phase 3: AI Chat Integration (0.5-1 day)
**Tech:** Claude API (Anthropic SDK)  
**Scope:**
- [ ] Chat panel component (right sidebar)
- [ ] Chat API endpoint (`POST /api/chat`)
  - Accept question + data context
  - Call Claude with system prompt
  - Return insight + reasoning
- [ ] Conversation history (store in SQLite)
- [ ] System prompt that includes:
  - Data schema
  - Sample rows (first 50)
  - Data statistics

**Example Prompt:**
```
You are a data analyst assistant. Here's the dataset:

Columns: customer_id, revenue, segment, created_at
Sample rows: [...]
Stats: { revenue: {min: 100, max: 50000, avg: 10000} }

Answer the user's question about this data with specific insights.
```

### Phase 4: Polish & Testing (0.5 day)
- [ ] Edge case handling (large files, missing data)
- [ ] Error messages (friendly UX)
- [ ] Loading states
- [ ] Mobile responsiveness

### Phase 5: Deployment (0.5 day)
- [ ] Deploy backend to Heroku/Railway (free tier)
- [ ] Deploy frontend to Vercel
- [ ] GitHub repo with docs
- [ ] README with:
  - What it is (data-as-a-product framework)
  - How it aligns with the target company
  - Live demo link
  - Screenshots
  - Usage guide

---

## Tech Stack (Recommended)

**Backend:**
- Node.js + Express
- SQLite (simple, file-based)
- Anthropic SDK (Claude API)
- `csv-parser` library
- `cors` middleware
- dotenv for config

**Frontend:**
- React (Vite for speed)
- Tailwind CSS (styling)
- Recharts (charts)
- Axios (HTTP client)

**Deployment:**
- Vercel (frontend, free tier)
- Railway or Heroku (backend, free tier)
- GitHub (code + documentation)

---

## Sample Data (Included)

Provide pre-loaded sample datasets so users can demo without uploading:

```javascript
// Sample: Customer Revenue Dataset
const sampleData = [
  { customer_id: "C001", revenue: 12500, segment: "Enterprise", created_at: "2024-01-15" },
  { customer_id: "C002", revenue: 3200, segment: "SMB", created_at: "2024-01-20" },
  // ... 50+ rows
];
```

---

## File Structure (Final)

```
/Users/t/Codes/labs/2026/data-as-product-dashboard/
├── product/
│   ├── 1-pager.md              ✓ Done
│   ├── requirements.md
│   └── user-flows.md
├── design/
│   ├── dashboard-mockup.pen    (pen.dev file)
│   ├── UI-specifications.md
│   └── color-palette.md
├── engineering/
│   ├── backend/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── db/
│   │   ├── .env.example
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   ├── public/
│   │   ├── vite.config.js
│   │   └── package.json
│   ├── scripts/
│   │   ├── seed-sample-data.js
│   │   └── deploy.sh
│   └── tests/
├── data/
│   ├── sample-customers.csv
│   ├── sample-transactions.csv
│   └── database-schema.sql
├── SKILL.md                    ✓ This file
├── README.md
├── .gitignore
└── package.json (root)
```

---

## Commands (Quick Start)

```bash
# Backend
cd engineering/backend
npm install
npm run dev          # Start server on :3001

# Frontend (separate terminal)
cd engineering/frontend
npm install
npm run dev          # Start Vite on :5173

# Deploy
npm run build        # Build frontend
npm run deploy       # Deploy to Vercel + Railway
```

---

## Key Features Explained (For the target company)

**Feature 1: Data Quality Scoring**  
Shows freshness (when was it last updated?), completeness (% of non-null values), and accuracy (simulated or inferred from data patterns). This directly addresses the target company's JD: *"Track value metrics post-release, interpret real user behavior."*

**Feature 2: Usage Metrics**  
Tracks adoption %,  queries/day, unique users. Shows if the data product is actually being used. Addresses: *"Define data-as-a-product goals and measurable success metrics."*

**Feature 3: Outcome Score (0-5)**  
Subjective rating: Is this data driving business decisions? This is the core of the product. Addresses: *"define outcomes that create tangible user and business value."*

**Feature 4: AI Chat Assistant**  
Claude-powered Q&A over the data. Addresses the target company's requirement: *"use cloud data platform and GenAI insights."* Shows you understand AI/LLM product development.

**Feature 5: Lineage Visualization**  
Shows where data comes from (raw → ETL → dataset). Addresses: *"Address user problems and needs within the data mesh approach."*

---

## Messaging (For Application)

**Cover Letter:**
> "I read your Product Owner job description and immediately recognized the 'data-as-a-product' framework you're implementing at the target company. To demonstrate my understanding of this operating model, I built Crystal—a working prototype that measures data product outcomes, integrates GenAI insights, and shows how to move from 'data exists' to 'data creates value.' The source code is at [GitHub link]."

**LinkedIn Message to a hiring contact:**
> "Hi the contact, it was great meeting you at [event]. I built this prototype of a data-as-a-product dashboard to dive deeper into your Product Owner role at the target company—I wanted to understand how you measure outcomes and track value. Would love your feedback: [live demo link]. Looking forward to exploring the role."

---

## What's NOT in Scope (MVP)

- ❌ Snowflake connection (use SQLite for MVP)
- ❌ Multi-user authentication (single-user MVP)
- ❌ Real data lineage via APIs (mock lineage diagram)
- ❌ Advanced ML (fake metrics, real framework)
- ❌ Slack/email notifications
- ❌ Scheduled reports

These can be added post-MVP if there's time.

---

## Success Criteria

**Technical:**
- [ ] Backend runs locally without errors
- [ ] Frontend loads CSV and displays dashboard
- [ ] Chat responds to questions about data
- [ ] Deployed to Vercel + Railway with live URL
- [ ] GitHub repo has clear README

**Portfolio:**
- [ ] You can demo in <5 minutes
- [ ] Aligns visibly with Role description language
- [ ] Shows AI/LLM shipping experience
- [ ] Differentiates you from other PM candidates

**Business:**
- [ ] Message to the contact lands (warm intro)
- [ ] Application emphasizes this prototype
- [ ] Interview conversation starter

---

## Next Steps

1. **Initialize backend:** `npm init` + install Express, csv-parser, Anthropic SDK
2. **Create database schema:** SQLite with `products` and `data_values` tables
3. **Build upload endpoint:** CSV → parse → store
4. **Initialize frontend:** Vite + React + Tailwind
5. **Build dashboard UI:** Product cards with hardcoded metrics
6. **Integrate Claude API:** Chat panel that reads data context
7. **Deploy:** Vercel + Railway + GitHub
8. **Outreach:** Message to the contact + apply

---

## Questions?

- "How do I get Anthropic API key?" → claude.ai/api
- "How do I host for free?" → Vercel (frontend), Railway (backend)
- "Can I use MongoDB instead of SQLite?" → Sure, but SQLite is simpler for MVP
- "How long to ship?" → 3-5 days if focused, 6-10 if learning new tech

**Timeline is tight but realistic.** Aim to apply early next week.

---

## Files Created So Far ✓

- [x] Directory structure (`/Users/t/Codes/labs/2026/data-as-product-dashboard/`)
- [x] 1-pager (`product/1-pager.md`)
- [x] Linear project ("Prism — Data-as-a-Product Dashboard")
- [x] Task breakdown (Linear issues)
- [x] This SKILL guide

**What's Next:**
- [ ] GitHub repo initialization
- [ ] Backend scaffolding
- [ ] Frontend setup
- [ ] API integration
- [ ] Deployment
- [ ] Outreach

---

**Last Updated:** Nov 5, 2026  
**Build Owner:** Taiwo Ayanleye  
**Target Company:** the target company (a hiring contact)  
**Deadline:** Apply early next week
