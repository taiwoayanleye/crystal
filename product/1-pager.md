# Data-as-a-Product Outcome Dashboard — 1-Pager

**Date:** November 2026  
**Target:** a Product Owner - Digital Enablement role  
**Build Timeline:** 5 days (Tue-Sat)  
**Status:** In progress

---

## Problem Statement

Enterprise teams struggle to measure whether datasets are creating business value. Traditional approaches:
- ❌ Data exists in a warehouse — but do people use it?
- ❌ Dashboard is built — but did it drive a decision?
- ❌ No feedback loop — "We shipped it, done"

**Result:** Billions spent on data infrastructure with no clear ROI or adoption metrics.

---

## Product Vision

**"Data as a Product" Operating Model**

Treat datasets like software products:
- Define the user problem the data solves
- Measure adoption and business outcomes (not just delivery)
- Continuously discover what insights matter
- Track value metrics post-release

Outcome: Data teams know *why* they're building, *who's* using it, and *what value it created*.

---

## Target User

**Primary:** a Product Owner - Digital Enablement  
- 5+ years PM experience in data/analytics
- Manages "connected suite of digital portfolio products"
- Accountability for "defining, pursuing and validating outcomes"
- Works with data platforms (Snowflake, ETL, semantic layers)
- Uses GenAI for insights

**Use Case:**
> "I own a suite of data products. I need to show my leadership which datasets are creating value, which are stale, and where to invest next. Right now I have dashboards but no outcome measurement framework."

---

## Key Features (MVP)

### 1. Data Product Intake
- Upload CSV / connect Snowflake (MVP: CSV only)
- Auto-detect schema, row count, data types
- Store as "data product"

### 2. Product Owner Defines Outcomes
- **Problem:** "What user problem does this data solve?"
- **Audience:** "Who uses this?"
- **Success Metrics:** "How do we measure value?" (pick 2-3 KPIs)
- **Hypothesis:** "What are we testing this sprint?"

### 3. Outcome Dashboard
**Per Dataset Card:**
- Quality Score (freshness %, completeness %, accuracy rating)
- Usage Metrics (queries/day, unique users, adoption %)
- Outcome Score (0-5: "Is this driving decisions?")
- Trend chart (adoption over time)
- Hypothesis tracker (what we tested, what we learned)

### 4. AI Chat Assistant (GenAI Feature) ⭐
- Ask: "What's our highest-value segment?"
- Claude analyzes the data + schema
- Returns: insight + reasoning + recommendation
- Demonstrates: "GenAI makes data accessible"

### 5. Lineage View
- Flow diagram: Raw Data → ETL → Dataset → Business Impact
- Shows dependencies

---

## Technical Approach

**Architecture:**
```
Frontend:     React (Vite)
Backend:      Node.js + Express
Database:     SQLite (MVP)
AI:           Claude API (chat)
Deployment:   Vercel (free tier)
Design:       pen.dev (interactive prototype)
```

**Data Flow:**
1. User uploads CSV → backend parses schema
2. Creates data product entry + metadata
3. Frontend displays dashboard with real-time metrics
4. Chat panel calls Claude API with data context
5. Stores conversation history

**Scope:**
- ~1500 LOC (backend + frontend combined)
- 1.5-2 days per product (3 total: this one is first)

---

## Success Metrics (For Portfolio)

**Shipping:**
- ✅ Live demo URL
- ✅ GitHub repo (well-documented)
- ✅ README explaining "why this matters for the target company"
- ✅ Sample data included (pre-loaded dataset)

**In Application:**
- ✅ Link to working prototype in cover letter
- ✅ Message to a hiring contact: "Built this to understand your data-as-a-product framework"
- ✅ Conversation starter: "How does this compare to what you're building?"

---

## Timeline

| Day | Task | Owner |
|-----|------|-------|
| Tue | Backend scaffolding + data ingestion | Engineering |
| Tue-Wed | React dashboard + UI components | Design/Frontend |
| Wed | AI chat integration + Claude API | Engineering |
| Wed-Thu | Testing + edge cases | QA |
| Thu | Deploy to Vercel + GitHub setup | DevOps |
| Fri | Documentation + README | Product |
| Fri-Mon | Outreach + application | Product |

---

## What "Done" Looks Like

**Minimum Viable:**
```
✅ Can upload CSV
✅ Parses schema automatically
✅ Dashboard shows: quality score, usage metrics, outcome score
✅ Chat can answer "what's in this data?" questions
✅ Deployed to live URL
✅ GitHub repo with clear README
✅ Can demo in 5 minutes
```

**Nice to Have (if time):**
- Snowflake connection (not CSV)
- Multi-dataset comparison
- Export reports as PDF
- User authentication

---

## Differentiation

**Why this wins:**
1. Shows you understand the target company's exact framework (from their JD)
2. AI chat demonstrates: "I ship AI products" (from your CV)
3. Working code > theoretical knowledge
4. You can say: *"I built this prototype of your data-as-product operating model to understand how you measure value"*

**Compared to typical PM portfolio:**
- Most PMs show: Figma mockups, case studies
- You show: Working software + AI + domain understanding

---

## Open Questions

- [ ] Should we add user authentication (Firebase)?
- [ ] Should we support Snowflake from day 1?
- [ ] Should we include email notifications on adoption changes?
- [ ] Should we support data lineage via metadata JSON?

---

## Definition of Done

- [x] 1-pager approved
- [ ] Design mockup in pen.dev
- [ ] Linear tasks created + prioritized
- [ ] SKILL.md written for Claude Code
- [ ] GitHub repo initialized
- [ ] Backend scaffolding complete
- [ ] Frontend components built
- [ ] Claude API integration working
- [ ] Deployed to Vercel
- [ ] README + documentation
- [ ] Demo video (optional)
- [ ] Application sent + outreach to a hiring contact
