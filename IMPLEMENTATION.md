# Crystal Implementation Guide — Next Steps

## 🎯 Objective

Build a **data-as-a-product dashboard** for the target company that demonstrates understanding of:
- Data quality metrics (freshness, completeness, accuracy)
- Usage metrics (adoption %, queries/day, unique users)
- Outcome measurement (is data driving business value?)
- GenAI insights via Claude API
- Data lineage visualization

**Target:** Deploy to Vercel by Nov 10, 2026  
**Design source:** pen.dev (`crystal.pen`) — all 5 screens + component library

---

## 📋 Phase 1 MVP Checklist

### Core Features (11 issues)

#### [TAI-11] Backend Scaffolding + CSV Data Ingestion
**Priority:** 🔴 HIGH — Blocks everything else

**What it does:**
1. Accept CSV file upload from frontend
2. Parse headers and detect schema
3. Store data in SQLite database
4. Return schema + row count to frontend

**Implementation:**
```typescript
// src/app/api/upload/route.ts
import formidable from 'formidable'
import { parseCSV } from '@/lib/csvParser'
import { saveDataset } from '@/lib/database'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const problemStatement = formData.get('problemStatement') as string
  const users = formData.get('users') as string

  // Parse CSV
  const { headers, rows, metadata } = await parseCSV(file)

  // Store in database
  const datasetId = await saveDataset({
    name: file.name,
    problem_statement: problemStatement,
    users,
    schema: headers,
    data: rows,
    metadata,
  })

  return Response.json({
    success: true,
    datasetId,
    rowCount: metadata.rowCount,
    columnCount: metadata.columnCount,
  })
}
```

**CSV Parser:**
```typescript
// src/lib/csvParser.ts
import Papa from 'papaparse'

export async function parseCSV(file: File) {
  const text = await file.text()
  const parsed = Papa.parse(text, { header: true })

  return {
    headers: parsed.data[0] ? Object.keys(parsed.data[0]) : [],
    rows: parsed.data,
    metadata: {
      rowCount: parsed.data.length,
      columnCount: Object.keys(parsed.data[0] || {}).length,
    },
  }
}
```

**Database Setup:**
```sql
-- src/lib/schema.sql
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  problem_statement TEXT,
  users TEXT,
  schema JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dataset_data (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL,
  row_index INTEGER,
  data JSON,
  created_at TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL,
  quality_score FLOAT,
  usage_count INTEGER DEFAULT 0,
  outcome_score FLOAT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);
```

---

#### [TAI-12] React Dashboard UI + Layout Components
**Priority:** 🔴 HIGH — Display the data

**Status:** 70% complete (Header, Sidebar, MetricCard done)

**What remains:**
1. ✅ Responsive grid layout (3 cols desktop, 2 cols tablet, 1 col mobile)
2. ✅ Loading states (skeleton cards while fetching)
3. 🔄 Empty state ("No datasets yet, add one to get started")
4. 🔄 Error state (display error toast if upload fails)
5. 🔄 Connect UploadModal to API

**Implementation:**

```typescript
// src/app/page.tsx - Update to fetch real data
'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch datasets on mount
    fetch('/api/datasets')
      .then(r => r.json())
      .then(data => {
        setDatasets(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-error">Error: {error}</div>
  }

  if (datasets.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-light mb-4">No datasets yet.</p>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          Add your first dataset
        </Button>
      </div>
    )
  }

  return (
    // ... existing dashboard code
  )
}
```

---

#### [TAI-13] Quality Metrics Dashboard (Freshness, Completeness, Accuracy)
**Priority:** 🔴 HIGH — Core value prop

**What it does:**
Calculate 3 quality metrics for each dataset:
1. **Freshness:** When was it last updated? (%)
2. **Completeness:** How many non-null values? (%)
3. **Accuracy:** Estimated from data patterns (%)

**Implementation:**

```typescript
// src/lib/metrics.ts
export function calculateQualityMetrics(data: any[], schema: string[]) {
  // Freshness: all data is "fresh" when uploaded (100%)
  // In production, track last_updated timestamp
  const freshness = 95 // Example: 95% means 2h old

  // Completeness: count non-null values
  let totalCells = data.length * schema.length
  let nullCells = 0
  
  data.forEach(row => {
    schema.forEach(col => {
      if (row[col] === null || row[col] === undefined || row[col] === '') {
        nullCells++
      }
    })
  })
  
  const completeness = Math.round(((totalCells - nullCells) / totalCells) * 100)

  // Accuracy: estimate from data consistency
  // Check for duplicate rows, outliers, type mismatches
  const duplicates = new Set(data.map(JSON.stringify)).size / data.length
  const accuracy = Math.round(duplicates * 100) // Simplified

  return {
    freshness,
    completeness,
    accuracy,
  }
}
```

**Store in database:**
```typescript
// src/lib/database.ts
export async function updateMetrics(datasetId: string, metrics: any) {
  // Save to metrics table
  db.run(`
    INSERT OR REPLACE INTO metrics (id, dataset_id, quality_score, outcome_score, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `, [
    `metric_${datasetId}`,
    datasetId,
    (metrics.freshness + metrics.completeness + metrics.accuracy) / 3,
    0, // Outcome score (TBD)
  ])
}
```

**Display in MetricCard:**
- Show 3 progress bars (quality, usage, outcome)
- Color: Green for quality metrics
- Store last_updated timestamp, display as "Updated 2h ago"

---

#### [TAI-14] Usage Metrics + Adoption Tracking
**Priority:** 🟠 MEDIUM — Shows engagement

**What it does:**
Track how many times a dataset is queried and by whom.

**Implementation:**

```typescript
// src/lib/metrics.ts
export function trackUsageQuery(datasetId: string, userId: string) {
  // Record: who queried, when
  db.run(`
    INSERT INTO usage_queries (id, dataset_id, user_id, queried_at)
    VALUES (?, ?, ?, datetime('now'))
  `, [`query_${Date.now()}`, datasetId, userId])
}

export function getUsageMetrics(datasetId: string) {
  // Get last 30 days of queries
  const queries = db.all(`
    SELECT DATE(queried_at) as date, COUNT(*) as count, COUNT(DISTINCT user_id) as users
    FROM usage_queries
    WHERE dataset_id = ? AND queried_at > datetime('now', '-30 days')
    GROUP BY DATE(queried_at)
    ORDER BY date
  `, [datasetId])

  // Calculate adoption %
  const totalUsers = db.get(`
    SELECT COUNT(DISTINCT user_id) as count FROM users
  `)

  const adoptionUsers = db.get(`
    SELECT COUNT(DISTINCT user_id) as count FROM usage_queries WHERE dataset_id = ?
  `, [datasetId])

  return {
    queriesPerDay: queries[queries.length - 1]?.count || 0,
    uniqueUsers: adoptionUsers.count,
    adoptionPercent: Math.round((adoptionUsers.count / totalUsers.count) * 100),
    trendData: queries, // For Recharts
  }
}
```

**Create TrendChart component:**
```typescript
// src/components/TrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#0066FF" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

#### [TAI-15] Claude API Chat Integration
**Priority:** 🔴 HIGH — Differentiator

**What it does:**
1. User asks a question about their data
2. Send to Claude with dataset context
3. Display formatted response with insights

**Implementation:**

```typescript
// src/lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function askClaude(question: string, datasetContext: any) {
  const response = await client.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a data analyst. A user is asking about their dataset.

Dataset: ${datasetContext.name}
Problem: ${datasetContext.problemStatement}
Users: ${datasetContext.users}
Metrics:
- Quality Score: ${datasetContext.metrics.quality}%
- Usage: ${datasetContext.metrics.usageCount} queries/day
- Adoption: ${datasetContext.metrics.adoption}%

Data sample (first 3 rows):
${JSON.stringify(datasetContext.sample, null, 2)}

User question: ${question}

Provide a concise, actionable insight (2-3 sentences max).`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
```

**API endpoint:**
```typescript
// src/app/api/chat/route.ts
export async function POST(request: Request) {
  const { message, datasetId } = await request.json()

  // Fetch dataset context
  const dataset = await getDataset(datasetId)
  const metrics = await getMetrics(datasetId)
  const sample = await getSampleRows(datasetId, 3)

  // Ask Claude
  const response = await askClaude(message, {
    ...dataset,
    metrics,
    sample,
  })

  return Response.json({ role: 'assistant', content: response })
}
```

**Update ChatPanel component:**
```typescript
// src/components/ChatPanel.tsx - Update handleSend()
const handleSend = async () => {
  // ... existing code ...
  
  const res = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: input,
      datasetId: selectedDatasetId,
    }),
  })

  const { content } = await res.json()
  // Add to messages
}
```

---

#### [TAI-16] Data Lineage Visualization (ETL Flow)
**Priority:** 🟠 MEDIUM — Shows sophistication

**What it does:**
Display the flow: [Raw Data] → [ETL] → [Transform] → [Dataset] → [Usage]

**Implementation:**

```typescript
// src/components/LineageFlow.tsx
export function LineageFlow({ dataset }) {
  return (
    <div className="bg-white p-6 rounded-lg">
      <h3 className="text-section-title mb-6">Data Lineage</h3>
      
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {/* Raw Data Box */}
        <div className="flex-shrink-0 w-32 p-4 bg-gray-50 rounded-lg border border-border text-center">
          <div className="text-small font-medium">📁 Raw Data</div>
          <div className="text-small text-text-light mt-1">{dataset.fileName}</div>
          <div className="text-small text-success mt-2">✓ Fresh</div>
        </div>

        <div className="text-2xl text-text-light">→</div>

        {/* ETL Box */}
        <div className="flex-shrink-0 w-32 p-4 bg-gray-50 rounded-lg border border-border text-center">
          <div className="text-small font-medium">⚙️ ETL</div>
          <div className="text-small text-text-light mt-1">Parse & Store</div>
          <div className="text-small text-text-light mt-2">Instant</div>
        </div>

        <div className="text-2xl text-text-light">→</div>

        {/* Database Box */}
        <div className="flex-shrink-0 w-32 p-4 bg-gray-50 rounded-lg border border-border text-center">
          <div className="text-small font-medium">🗄️ Dataset</div>
          <div className="text-small text-text-light mt-1">{dataset.name}</div>
          <div className="text-small text-success mt-2">Ready</div>
        </div>

        <div className="text-2xl text-text-light">→</div>

        {/* Usage Box */}
        <div className="flex-shrink-0 w-32 p-4 bg-gray-50 rounded-lg border border-border text-center">
          <div className="text-small font-medium">📊 Usage</div>
          <div className="text-small text-text-light mt-1">{dataset.usageCount} queries</div>
          <div className="text-small text-primary mt-2">Active</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 text-small">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success"></span>
          <span>Fresh</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-warning"></span>
          <span>Stale</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-error"></span>
          <span>Error</span>
        </div>
      </div>
    </div>
  )
}
```

---

#### [TAI-17] Testing + Edge Case Handling
**Priority:** 🟡 LOW — Can add after MVP deployed

**Test cases:**
- Empty CSV file → Show error "File is empty"
- Invalid CSV (malformed) → Show error "Invalid CSV format"
- Large file (>10MB) → Show error "File too large"
- Duplicate headers → Handle gracefully
- Special characters in data → Escape properly
- Network error on upload → Show retry button
- Claude API timeout → Show "Couldn't fetch insights, try again"

---

#### [TAI-18] Deploy to Vercel + GitHub
**Priority:** 🔴 HIGH — Share with the target company

```bash
# 1. Initialize GitHub
git init
git add .
git commit -m "Initial commit: Crystal MVP"
git remote add origin https://github.com/YOUR_USERNAME/crystal.git
git push -u origin main

# 2. Deploy to Vercel
npm i -g vercel
vercel login
vercel --prod

# 3. Set environment variables in Vercel dashboard
# ANTHROPIC_API_KEY=sk-ant-...
# DATABASE_URL=file:./crystal.db
```

**Result:** Live at `crystal-TAI.vercel.app`

---

#### [TAI-19] Documentation + README
**Priority:** 🟡 LOW — But required for context

**README sections:**
1. Overview + screenshot
2. Features (MVP)
3. Tech stack
4. Quick start
5. API docs
6. Deployment

---

#### [TAI-20] the target company Outreach + Application
**Priority:** 🔴 HIGH — End goal

**After MVP is live:**
1. Get Vercel URL
2. Draft message to a hiring contact:

> Hi the contact, it was great meeting you at the event! I built Crystal to dive deeper into how the target company approaches data-as-a-product and GenAI insights.
>
> Crystal measures whether datasets create business value through:
> - Quality metrics (freshness, completeness, accuracy)
> - Usage metrics (adoption %, queries/day)
> - Outcome measurement (hypothesis tracking)
> - Claude AI chat for instant insights
>
> This reflects your Product Owner JD's focus on defining data success metrics and using cloud data + GenAI. Would love your feedback: [demo link]
>
> Looking forward to exploring the Digital Enablement role!

3. Share demo link: `https://crystal-TAI.vercel.app`
4. Submit application with link in cover letter

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add environment variables
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:3000

# 5. Test upload:
# - Click "+ Add Dataset"
# - Fill form + upload sample CSV
# - See metrics display
```

---

## 📚 Reference Files

- `crystal.pen` — Design mockups (5 screens + components)
- `DESIGN-SPEC.md` — Layout + spacing details
- `LINEAR-ROADMAP.md` — Full 3-phase plan
- `SKILL.md` — Original build guide

---

## 🎨 Design Alignment

All components match pen.dev design:
- Colors: From design-system.md
- Typography: 32px page title, 20px section title, 14px body, 24px metrics
- Spacing: 4/8/16/24/32px scale
- Shadows: Subtle (sm), cards (md), modals (lg)
- Radius: 4px (inputs), 8px (cards), 12px (buttons)

---

## ⏰ Timeline

- **Now - 1hr:** TAI-11 (CSV parsing + backend)
- **1hr - 2.5hrs:** TAI-12 (dashboard refinements) + TAI-13 (quality metrics)
- **2.5hrs - 3.5hrs:** TAI-14 (usage metrics) + TAI-15 (Claude chat)
- **3.5hrs - 4.5hrs:** TAI-16 (data lineage) + product detail page
- **4.5hrs - 5hrs:** TAI-17 (testing) + error handling
- **5hrs - 6hrs:** TAI-18 (Vercel deploy) + TAI-19 (docs)
- **6hrs - 7hrs:** TAI-20 (the target company outreach)

**Target:** MVP deployed by EOD Nov 5, 2026

---

## ✅ Success Criteria

- [ ] CSV upload works end-to-end
- [ ] Dashboard displays 3 sample datasets with metrics
- [ ] Chat can ask questions and get Claude insights
- [ ] Data lineage shows ETL flow
- [ ] Product detail page works
- [ ] Deployed to Vercel with public URL
- [ ] Application submitted to the target company
- [ ] Message sent to a hiring contact with demo link

---

**Next:** Start implementing TAI-11 (CSV parsing backend). Good luck! 🚀
