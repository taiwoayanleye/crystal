# Crystal MVP Checklist — Nov 5-10, 2026

## 📊 Project: Data-as-a-Product Dashboard for the target company

---

## Phase 1: MVP Implementation (10 Tasks)

### Foundation ✅
- [x] Project scaffold (Next.js 14, TypeScript, Tailwind)
- [x] Design system setup (colors, typography, spacing from pen.dev)
- [x] Component library (Button, ProgressBar, MetricCard, ChatPanel, UploadModal)
- [x] Linear project renamed to "Crystal"
- [x] GitHub repository ready

---

## Core Implementation 🔄

### TAI-11: Backend Scaffolding + CSV Ingestion
- [ ] CSV parser using PapaParse
- [ ] /api/upload endpoint
- [ ] SQLite database schema
- [ ] Save dataset + rows to DB
- [ ] Return schema + row count
- [ ] Error handling (invalid file, file too large, etc.)
- [ ] **Status:** Ready to implement

### TAI-12: React Dashboard UI
- [x] Header component (logo, nav, account)
- [x] Sidebar component (dataset list, add button)
- [x] MetricCard component (quality/usage/outcome bars)
- [ ] Main page layout (3-column grid)
- [ ] Connect to API to fetch datasets
- [ ] Loading skeletons while fetching
- [ ] Empty state (no datasets)
- [ ] Error toast notifications
- [ ] Connect UploadModal to /api/upload
- [ ] **Status:** 70% complete

### TAI-13: Quality Metrics Dashboard
- [ ] Implement calculateQualityMetrics()
  - [ ] Freshness calculation (%)
  - [ ] Completeness calculation (%)
  - [ ] Accuracy calculation (%)
- [ ] Store metrics in DB
- [ ] Fetch metrics on dashboard load
- [ ] Display 3 progress bars with colors
  - [ ] Green for quality metrics (#10B981)
  - [ ] Show percentage + label
- [ ] Show "Updated 2h ago" timestamp
- [ ] **Status:** Not started

### TAI-14: Usage Metrics + Adoption Tracking
- [ ] Create TrendChart component (Recharts)
- [ ] Implement getUsageMetrics()
  - [ ] Queries/day calculation
  - [ ] Unique users tracking
  - [ ] Adoption % calculation
  - [ ] 30-day trend data
- [ ] Store usage queries in DB
- [ ] Fetch usage data on product detail load
- [ ] Display:
  - [ ] "12 queries/day (↑20% from last week)"
  - [ ] "5 unique users (Finance, Product)"
  - [ ] "60% adoption of org"
  - [ ] 30-day trend line chart
- [ ] **Status:** Not started

### TAI-15: Claude API Chat Integration
- [ ] Claude API client setup (src/lib/claude.ts)
- [ ] /api/chat endpoint
- [ ] Message history management (in-memory or DB)
- [ ] Context assembly (dataset info + metrics)
- [ ] Send message → Claude → display response
- [ ] Loading state ("Thinking..." with dots)
- [ ] Error handling (API timeout, rate limit, etc.)
- [ ] Format Claude response nicely (bold numbers, bullets)
- [ ] **Status:** UI complete, API integration pending

### TAI-16: Data Lineage Visualization
- [ ] Create LineageFlow component
- [ ] Show flow: Raw Data → ETL → Transform → Dataset → Usage
- [ ] Box styling (gray bg, border, 32px)
- [ ] Arrows between boxes (→)
- [ ] Color-code by status
  - [ ] ✓ Fresh (Green #10B981)
  - [ ] ⚠ Stale (Orange #F59E0B)
  - [ ] ✗ Error (Red #EF4444)
- [ ] Legend at bottom
- [ ] Horizontal scroll on mobile
- [ ] **Status:** Not started

### TAI-17: Product Detail Page
- [ ] Create /detail/[id]/page.tsx
- [ ] Fetch dataset by ID
- [ ] Display metadata
  - [ ] Problem statement
  - [ ] Owner
  - [ ] Refresh cadence
  - [ ] Created date
- [ ] Show quality metrics (freshness, completeness, accuracy)
- [ ] Show usage metrics + trend chart
- [ ] Show outcome tracking (hypothesis, status, result, impact)
- [ ] Show data lineage
- [ ] Edit/Archive/Delete buttons
- [ ] Back button
- [ ] **Status:** Not started

### TAI-18: Testing + Edge Cases
- [ ] CSV parsing tests
  - [ ] Valid CSV → parses correctly
  - [ ] Empty CSV → error message
  - [ ] Invalid CSV (malformed) → error message
  - [ ] Large file (>10MB) → error message
- [ ] Metrics calculation tests
  - [ ] Empty data → 0% metrics
  - [ ] All nulls → 0% completeness
  - [ ] All filled → 100% completeness
- [ ] API tests
  - [ ] Network error → retry button
  - [ ] 500 error → error message
  - [ ] Timeout → timeout message
- [ ] Claude API tests
  - [ ] Response formatting
  - [ ] Error handling
  - [ ] Context limits
- [ ] **Status:** Not started

### TAI-19: Deploy to Vercel
- [ ] Create GitHub repo
- [ ] Connect to Vercel
- [ ] Set environment variables
  - [ ] ANTHROPIC_API_KEY
  - [ ] DATABASE_URL (if needed)
- [ ] Deploy to production
- [ ] Get public URL (crystal-TAI.vercel.app)
- [ ] Test end-to-end on live URL
- [ ] **Status:** Ready to deploy

### TAI-20: Documentation + README
- [ ] README.md with sections:
  - [ ] Project overview
  - [ ] Features
  - [ ] Tech stack
  - [ ] Quick start
  - [ ] API documentation
  - [ ] Component library guide
  - [ ] Deployment steps
- [ ] API.md documenting endpoints
  - [ ] POST /api/upload
  - [ ] GET /api/datasets
  - [ ] GET /api/datasets/:id
  - [ ] POST /api/chat
- [ ] ARCHITECTURE.md explaining design
- [ ] **Status:** Not started

### TAI-21: the target company Outreach
- [ ] Get Vercel URL
- [ ] Draft message to a hiring contact
- [ ] Share demo link
- [ ] Submit the target company application with link
- [ ] **Status:** Blocked until TAI-19 complete

---

## 📱 Component Checklist

All components should match pen.dev design exactly.

### Colors
- [ ] Primary Blue: #0066FF
- [ ] Navy: #001A4D
- [ ] Success Green: #10B981
- [ ] Warning Orange: #F59E0B
- [ ] Error Red: #EF4444
- [ ] Text Dark: #1F2937
- [ ] Text Light: #6B7280
- [ ] Background: #F5F7FA
- [ ] White: #FFFFFF
- [ ] Border: #E5E7EB

### Typography
- [ ] Page Title: 32px, 700 weight, navy
- [ ] Section Title: 20px, 600 weight, navy
- [ ] Body: 14px, 400 weight, text-dark
- [ ] Small: 12px, 400 weight, text-light
- [ ] Metric: 24px, 700 weight, monospace

### Components
- [x] Button (primary, secondary, danger)
- [x] ProgressBar (quality, usage, outcome colors)
- [x] MetricCard (300×280, icon + title + 3 bars + hypothesis)
- [x] Header (logo, nav, account)
- [x] Sidebar (dataset list, add button)
- [x] ChatPanel (messages, input, loading)
- [x] UploadModal (form with file upload)
- [ ] TrendChart (Recharts line chart)
- [ ] LineageFlow (ETL boxes + arrows)
- [ ] Toast (error/success notifications)

---

## 🎯 Daily Standup

### Day 1 (Nov 5) — Foundation ✅
- [x] Project scaffold complete
- [x] Design system + Tailwind setup
- [x] Component library (50% of components)
- [x] Linear project renamed
- [ ] TAI-11 (CSV backend) — 20% start

### Day 2 (Nov 6) — Backend + Dashboard
- [ ] TAI-11 complete (CSV parsing + /api/upload)
- [ ] TAI-12 complete (dashboard layout)
- [ ] TAI-13 complete (quality metrics)
- [ ] Start TAI-14 (usage metrics)

### Day 3 (Nov 7) — Metrics + Chat
- [ ] TAI-14 complete (usage metrics + charts)
- [ ] TAI-15 complete (Claude chat integration)
- [ ] Start TAI-16 (data lineage)

### Day 4 (Nov 8) — Polish + Lineage
- [ ] TAI-16 complete (lineage visualization)
- [ ] TAI-12 refinements (error states, loading)
- [ ] Start TAI-17 (testing)

### Day 5 (Nov 9) — Testing + Deploy
- [ ] TAI-17 complete (error handling)
- [ ] TAI-19 complete (Vercel deployment)
- [ ] TAI-20 complete (README + docs)
- [ ] Live URL ready

### Day 6 (Nov 10) — the target company Launch
- [ ] TAI-21 complete (the target company outreach)
- [ ] Message sent to a hiring contact
- [ ] Application submitted

---

## 🚀 Launch Readiness

Before sharing with the target company:

### Functionality
- [ ] Upload CSV → metrics display
- [ ] All 3 sample datasets visible
- [ ] Click card → goes to detail page
- [ ] Chat sends message → gets Claude response
- [ ] Data lineage shows correctly
- [ ] No console errors
- [ ] No network errors

### Design
- [ ] Colors match pen.dev exactly
- [ ] Typography sizes correct
- [ ] Spacing (4/8/16/24/32px) consistent
- [ ] Shadows match (sm/md/lg)
- [ ] Border radius correct (4/8/12px)
- [ ] Responsive on mobile (tested)
- [ ] Responsive on tablet (tested)
- [ ] Responsive on desktop (tested)

### Performance
- [ ] Page loads in <3 seconds
- [ ] Chat response <5 seconds
- [ ] No layout shift (CLS < 0.1)
- [ ] Mobile Lighthouse score >80

### User Experience
- [ ] Can upload CSV without errors
- [ ] Error messages are clear
- [ ] Loading states show progress
- [ ] All buttons are clickable
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] No 404s or broken links

---

## 📞 the target company Message Template

Once MVP is live:

> Hi the contact,
>
> Great meeting you at the event! I built **Crystal** to dive deeper into the target company's data-as-a-product framework.
>
> Crystal measures whether datasets create business value:
> - **Quality metrics:** Freshness, completeness, accuracy
> - **Usage metrics:** Adoption %, queries/day, unique users
> - **Outcome measurement:** Hypothesis tracking
> - **AI insights:** Claude API chat for instant analysis
>
> This reflects your Product Owner JD's focus on defining data success metrics and leveraging cloud data + GenAI.
>
> **Demo:** [vercel-url]
> **GitHub:** [github-url]
>
> Would love your feedback! Excited about the Digital Enablement role.
>
> Best,
> Taiwo

---

## 🎓 Success Metrics (Phase 1 Complete When...)

✅ MVP deployed to Vercel with public URL  
✅ CSV upload works end-to-end  
✅ Dashboard displays metrics + chat works  
✅ All 5 screens from pen.dev mockups are functional  
✅ Data lineage visualization renders correctly  
✅ Message sent to a hiring contact with demo link  
✅ Application submitted to the target company  
✅ README + GitHub repo complete  

---

## 📅 Deadline Tracker

| Task | Start | Due | Status |
|------|-------|-----|--------|
| TAI-11 | Nov 5 | Nov 6 | ⏳ |
| TAI-12 | Nov 5 | Nov 6 | ⏳ |
| TAI-13 | Nov 6 | Nov 7 | ⏳ |
| TAI-14 | Nov 7 | Nov 8 | ⏳ |
| TAI-15 | Nov 7 | Nov 8 | ⏳ |
| TAI-16 | Nov 8 | Nov 9 | ⏳ |
| TAI-17 | Nov 8 | Nov 9 | ⏳ |
| TAI-19 | Nov 9 | Nov 10 | ⏳ |
| TAI-20 | Nov 10 | Nov 10 | ⏳ |
| TAI-21 | Nov 10 | Nov 10 | ⏳ |

---

**Status:** MVP Scaffold Complete ✅  
**Next:** Implement TAI-11 (CSV parsing backend)  
**Timeline:** 5 days to the target company launch  

🚀 Let's build!
