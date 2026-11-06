# Crystal — Next.js Implementation Guide

## Project Status

**Phase 1 MVP:** Implementation started  
**Design Source:** pen.dev (`crystal.pen`)  
**Target Deployment:** Nov 10-15, 2026

---

## Design Direction from pen.dev

The crystal.pen design file defines **5 screens** and **5 reusable components**:

### Screens (Implemented/In Progress)
1. ✅ **Dashboard Home** (1440×900) — Main overview with metric cards
2. 🔄 **Product Detail** (1440×1200) — Deep dive into a dataset
3. 🔄 **Upload Modal** (500×600) — Add new dataset
4. 🔄 **Chat Panel** (350×500) — Claude AI assistant
5. 🔄 **Data Lineage** (1440×600) — ETL flow visualization

### Components (Implemented)
- ✅ **MetricCard** — 300×280, shows quality/usage/outcome metrics
- ✅ **ProgressBar** — 6px height, color-coded (success/primary/warning)
- ✅ **Button** — Primary, Secondary, Danger variants
- ✅ **ChatPanel** — Message interface with loading states
- ✅ **UploadModal** — Form for adding datasets

---

## Design System (from pen.dev design spec)

### Color Palette
```css
Primary Blue:    #0066FF
Navy:            #001A4D
Success Green:   #10B981
Warning Orange:  #F59E0B
Error Red:       #EF4444
Text Dark:       #1F2937
Text Light:      #6B7280
Background:      #F5F7FA
White:           #FFFFFF
Border:          #E5E7EB
```

### Typography
- **Page Title:** 32px, 700 weight, navy
- **Section Title:** 20px, 600 weight, navy
- **Body:** 14px, 400 weight, text-dark
- **Small:** 12px, 400 weight, text-light
- **Metric Numbers:** 24px, 700 weight, monospace

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Shadows
- sm: `0 1px 2px rgba(0,0,0,0.05)`
- md: `0 4px 6px rgba(0,0,0,0.1)`
- lg: `0 10px 15px rgba(0,0,0,0.1)`

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px

---

## Project Structure

```
crystal/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard home (TAI-12, TAI-13, TAI-14)
│   │   ├── detail/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Product detail page
│   │   ├── api/
│   │   │   ├── upload/         # CSV upload endpoint (TAI-11)
│   │   │   └── chat/           # Claude API integration (TAI-15)
│   │   └── styles/
│   │       └── globals.css     # Design tokens + Tailwind
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ChatPanel.tsx       # Claude chat interface (TAI-15)
│   │   ├── UploadModal.tsx     # CSV upload form (TAI-11)
│   │   ├── LineageFlow.tsx     # Data lineage visualization (TAI-16)
│   │   └── TrendChart.tsx      # Recharts integration (TAI-14)
│   ├── lib/
│   │   ├── csvParser.ts        # Parse CSV files (TAI-11)
│   │   ├── metrics.ts          # Quality/usage/outcome calculations (TAI-13, TAI-14)
│   │   ├── claude.ts           # Claude API client (TAI-15)
│   │   └── types.ts            # TypeScript definitions
│   └── services/
│       ├── database.ts         # SQLite queries (TAI-11)
│       └── dataProcessor.ts    # Process uploaded data
├── .env.local                  # Environment variables (Claude API key)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 1 MVP — 10 Issues

### TAI-11: Backend Scaffolding + CSV Ingestion
**Status:** In progress (basic scaffold complete)

**What to implement:**
```typescript
// src/lib/csvParser.ts
export function parseCSV(file: File): Promise<{
  headers: string[]
  rows: Record<string, any>[]
  metadata: {
    rowCount: number
    columnCount: number
  }
}>

// src/app/api/upload/route.ts
POST /api/upload
Body: FormData with CSV file
Response: { datasetId, schema, rowCount }
```

**Database schema (SQLite):**
```sql
-- Datasets
CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  problem_statement TEXT,
  users TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Data rows (dynamic schema per dataset)
CREATE TABLE dataset_{id}_data (
  id TEXT PRIMARY KEY,
  [column_name] TEXT/NUMBER,
  created_at TIMESTAMP
)

-- Metrics
CREATE TABLE metrics (
  id TEXT PRIMARY KEY,
  dataset_id TEXT FOREIGN KEY,
  quality_score FLOAT,
  usage_count INT,
  outcome_score FLOAT,
  updated_at TIMESTAMP
)
```

---

### TAI-12: React Dashboard UI + Layout
**Status:** Partially complete (Header, Sidebar, MetricCard ready)

**What to implement:**
- ✅ Header (logo, nav, account)
- ✅ Sidebar (dataset list, add button)
- ✅ MetricCard component
- 🔄 Responsive layout for mobile/tablet
- 🔄 Loading skeletons during data fetch
- 🔄 Empty state when no datasets

**Key files:**
```
src/app/page.tsx           # Main dashboard
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/MetricCard.tsx
```

---

### TAI-13: Quality Metrics Dashboard
**Status:** Not started

**What to implement:**
```typescript
// src/lib/metrics.ts
export function calculateQualityMetrics(data: any[]) {
  return {
    freshness: number,      // % (when last updated)
    completeness: number,   // % (non-null values)
    accuracy: number,       // % (estimated from patterns)
  }
}

// Component shows:
// Freshness: ████░░ 95% ✅ Updated 2h ago
// Completeness: █████░ 98% (2 missing values)
// Accuracy: ███░░░ 70% (Inferred)
```

**Progress bar colors:**
- Quality: Green (#10B981)
- Usage: Blue (#0066FF)
- Outcome: Green (>50) or Orange (<=50)

---

### TAI-14: Usage Metrics + Adoption Tracking
**Status:** Not started

**What to implement:**
```typescript
// Track usage per dataset
export function trackQuery(datasetId: string) {
  // Increment query count
  // Record unique user
  // Update adoption %
}

// Calculate 30-day trend (using Recharts)
export function getTrendData(datasetId: string) {
  return [
    { date: '2026-10-06', queries: 8 },
    { date: '2026-10-07', queries: 12 },
    // ...
  ]
}
```

**Display:**
- 12 queries/day (↑20% from last week)
- 5 unique users (Finance, Product)
- 60% adoption of org
- 30-day trend line chart (Recharts)

---

### TAI-15: Claude API Chat Integration
**Status:** Partially complete (UI skeleton ready)

**What to implement:**
```typescript
// src/lib/claude.ts
export async function askClaude(
  message: string,
  datasetContext: any
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Context: ${JSON.stringify(datasetContext)}\n\nQuestion: ${message}`,
        },
      ],
    }),
  })
  // Parse and return response
}

// src/app/api/chat/route.ts
POST /api/chat
Body: { message, datasetId }
Response: { role: 'assistant', content: '...' }
```

**Chat interface (UI complete):**
- User message: right-aligned, blue bg, white text
- Claude message: left-aligned, gray bg, dark text
- Loading state: "Thinking..." with animated dots
- Input field at bottom (sticky)

---

### TAI-16: Data Lineage Visualization
**Status:** Not started

**What to implement:**
```typescript
// src/components/LineageFlow.tsx
// Flow: [Raw Data] → [ETL] → [Transformation] → [Dataset] → [Usage]

// Box format:
// "S3 CSV, 1.2GB, ✓Fresh"
// "Python Script, updated hourly"
// "Semantic Layer, 3 views"
// "Customer Revenue Dataset"
// "Used By: Finance Dash, LTV Model, Forecasting"
```

**Colors by status:**
- ✓ Fresh: Green (#10B981)
- ⚠ Stale: Orange (#F59E0B)
- ✗ Error: Red (#EF4444)

---

### TAI-17: Testing + Edge Case Handling
**Status:** Not started

**Test coverage:**
- CSV parsing (valid/invalid/empty files)
- Metric calculations (edge cases: empty data, nulls, outliers)
- API error handling (network errors, rate limits)
- Chat integration (context limits, token usage)
- File uploads (size limits, format validation)

---

### TAI-18: Deploy to Vercel + GitHub
**Status:** Ready for deployment

```bash
# Setup Vercel
vercel login
vercel --prod

# Environment variables needed:
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=file:./crystal.db  # SQLite
```

---

### TAI-19: Documentation + README
**Status:** Not started

**Include:**
- Architecture overview
- Setup instructions (npm install, .env setup)
- API documentation
- Component library guide
- Deployment steps

---

### TAI-20: the target company Outreach + Application
**Status:** Not started

**After MVP is live:**
1. Generate demo link from Vercel
2. Draft personalized message to a hiring contact:
   - "Built this to understand your data-as-a-product framework"
   - "Demonstrates GenAI insights (Claude chat)"
   - "Shows outcome measurement thinking"
3. Submit application with demo link

---

## Next Steps

### Immediate (Next 1-2 hours)
1. ✅ Create project scaffold (DONE)
2. ✅ Set up design system with Tailwind (DONE)
3. ✅ Build component library (DONE)
4. 🔄 Implement CSV parsing + upload endpoint (TAI-11)
5. 🔄 Complete dashboard layout (TAI-12)

### Short term (Next 2-3 hours)
6. Quality metrics display (TAI-13)
7. Usage metrics + Recharts trend (TAI-14)
8. Claude API integration (TAI-15)

### Medium term (Next 3-4 hours)
9. Data lineage visualization (TAI-16)
10. Product detail page
11. Testing suite (TAI-17)

### Ready for deployment (EOD)
12. Deploy to Vercel (TAI-18)
13. Polish documentation (TAI-19)
14. Outreach to a hiring contact (TAI-20)

---

## Environment Setup

```bash
# Install dependencies
npm install

# Create .env.local
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev

# Opens at http://localhost:3000
```

---

## Key Design Decisions

### Backend: Node.js API Routes
- SQLite for MVP (phase 1)
- Upgrade to PostgreSQL/Snowflake in Phase 2
- Connector abstraction pattern ready for multi-source

### Frontend: React 18 + Next.js 14
- Server + Client components (hybrid rendering)
- Tailwind CSS for styling (matches pen.dev tokens)
- No UI library dependencies (built from scratch to match design)

### Data Flow
```
User uploads CSV
↓
Backend parses & stores in SQLite
↓
Frontend fetches via API
↓
Display metrics + calculations
↓
Chat context includes data + metrics
↓
Claude API provides insights
```

### Claude Integration
- Context: Dataset metadata + recent metrics
- Model: claude-opus-4-1-20250805
- Rate limiting: Standard Anthropic limits
- Error handling: Graceful degradation if API unavailable

---

## Pen.dev Design File Location

**File:** `/Users/t/Codes/labs/2026/crystal/design/crystal.pen`

**Components available:**
- Frame: ProgressBar
- Frame: Button Primary
- Frame: Button Secondary
- Frame: Button Danger
- Frame: MetricCard
- Frame: Dashboard Home
- Frame: Product Detail
- Frame: Upload Modal
- Frame: Chat Panel
- Frame: Data Lineage

**Design tokens exported in:**
- Colors: CSS variables in `globals.css`
- Typography: Tailwind `fontSize` utilities
- Spacing: Tailwind `spacing` scale
- Shadows: Tailwind `boxShadow` definitions

---

## Testing Checklist (Phase 1 MVP)

- [ ] CSV upload works with valid files
- [ ] Metrics display correctly (quality/usage/outcome)
- [ ] Chat sends message to Claude API and displays response
- [ ] Data lineage renders ETL flow diagram
- [ ] Product detail page loads dataset info
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All buttons + interactions match pen.dev design
- [ ] Error states displayed (empty data, invalid file, API errors)
- [ ] Loading states show (skeleton, spinner, "Thinking...")
- [ ] Accessibility: keyboard navigation + focus states

---

## Success Metrics

✅ MVP ready for demo by Nov 10  
✅ Live Vercel deployment with demo URL  
✅ Application submitted to the target company with product link  
✅ Personalized outreach to a hiring contact with context (built to understand data-as-product)

---

**Next:** Start implementing TAI-11 (CSV parsing + backend) and TAI-12 (dashboard refinements).
