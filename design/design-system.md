# Crystal Dashboard — Design System

**Product:** Crystal (Data-as-a-Product Dashboard)  
**Target:** a Product Owner  
**Theme:** Modern, data-forward, enterprise  
**Status:** Design specification (ready for development)

---

## Visual Identity

**Product Name:** Crystal  
**Tagline:** "See your data's impact clearly"  
**Core Metaphor:** Data flows through a prism, revealing different facets of value

**Color Palette:**

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #0066FF | Links, CTA buttons, active states |
| Dark Navy | #001A4D | Headers, dark backgrounds |
| Light Gray | #F5F7FA | Card backgrounds, dividers |
| Success Green | #10B981 | Quality scores, positive metrics |
| Warning Orange | #F59E0B | Medium metrics, caution |
| Error Red | #EF4444 | Poor metrics, errors |
| Text Dark | #1F2937 | Primary text |
| Text Light | #6B7280 | Secondary text |
| White | #FFFFFF | Card backgrounds, containers |

---

## Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Crystal  [Logo]         Home  |  Docs  |  GitHub           │  ← Header
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Left Sidebar (240px)   │  Main Content Area (900px)        │
│  ─────────────────      │                                   │
│  📊 Dashboard           │  ┌──────────────────────────────┐ │
│  ✨ Add Dataset          │  │  Data Products (3)           │ │
│                          │  ├──────────────────────────────┤ │
│  My Datasets:           │  │                              │ │
│  • Customer Revenue    │  │  ┌──────────────────────────┐ │ │
│  • Transactions        │  │  │ Customer Revenue Dataset │ │ │
│  • Orders              │  │  │                          │ │ │
│                        │  │  │ Quality: ████░░ 85%     │ │ │
│  [Sort ▼]             │  │  │ Usage:   ███░░░ 60%     │ │ │
│  [Filter]             │  │  │ Outcome: ██░░░░ 40/100   │ │ │
│                        │  │  │                          │ │ │
│                        │  │  │ 📈 Adoption Trend        │ │ │
│                        │  │  │ [Chart showing 30d trend]│ │ │
│                        │  │  │                          │ │ │
│                        │  │  │ 💡 Hypothesis:           │ │ │
│                        │  │  │ "Does this predict LTV?" │ │ │
│                        │  │  │ Result: Testing...       │ │ │
│                        │  │  └──────────────────────────┘ │ │
│                        │  │                              │ │
│                        │  │  ┌──────────────────────────┐ │ │
│                        │  │  │ Transactions Dataset     │ │ │
│                        │  │  │ [Same card layout]       │ │ │
│                        │  │  └──────────────────────────┘ │ │
│                        │  │                              │ │
│                        │  └──────────────────────────────┘ │
│                        │                                   │
│                        │  ┌──────────────────────────────┐ │
│                        │  │  Chat Assistant            │ │ │
│                        │  ├──────────────────────────────┤ │
│                        │  │ "What's driving our revenue?" │ │
│                        │  │                              │ │
│                        │  │ 🤖 Claude: Your top revenue │ │
│                        │  │    drivers are Enterprise    │ │
│                        │  │    customers in EMEA region  │ │
│                        │  │    (42% of total revenue)... │ │
│                        │  │                              │ │
│                        │  │ [Input: Ask about this data] │ │
│                        │  └──────────────────────────────┘ │
│                        │                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Screens

### 1. Dashboard (Home Page)

**Header Section:**
- Logo + product name: "Crystal"
- Navigation: Home, Documentation, GitHub link
- Account dropdown (avatar placeholder)

**Left Sidebar (Fixed):**
- Dashboard icon + "Dashboard" link
- "Add Dataset" button (+ icon)
- List of user's datasets (scrollable)
- Sort/Filter controls at bottom

**Main Content Area:**
- Title: "Data Products (3)" or "Your Datasets"
- Grid of product cards (responsive: 1 col on mobile, 2-3 on desktop)
- Chat panel (right side, persistent)

---

### 2. Product Card Component

**Card Layout:**
```
┌────────────────────────────────┐
│ 📊 Customer Revenue Dataset    │
├────────────────────────────────┤
│                                │
│ Quality Score:  ████░░  85%   │
│ → Freshness: ✅ Updated 2h ago │
│ → Completeness: 95% of rows    │
│ → Accuracy: High               │
│                                │
│ Usage Metrics:  ███░░░  60%   │
│ → 12 queries/day               │
│ → 5 unique users               │
│ → Adoption: 60%                │
│                                │
│ Outcome Score:  ██░░░░  40/100 │
│ → Is this driving decisions?   │
│ → Business impact: Moderate    │
│                                │
│ [📈 Adoption Trend Chart]      │
│                                │
│ 💡 Hypothesis:                 │
│ "Does this predict customer    │
│  lifetime value?"              │
│ Status: Testing (Week 1 of 4)  │
│                                │
│ [View Details]  [Remove]       │
└────────────────────────────────┘
```

**Card States:**
- **Active/Highlighted:** Blue border, slight shadow
- **Hover:** Shadow deepens, cursor = pointer
- **Loading:** Skeleton placeholders for metrics

**Metrics Visualization:**
- Quality, Usage, Outcome = horizontal progress bars (color-coded)
- Quality Bar: Green (good) → Orange (medium) → Red (poor)
- Chart: 30-day adoption trend (line chart, Recharts)
- Metric numbers: Large, bold, easy to scan

---

### 3. Upload/Add Dataset Modal

**Trigger:** "Add Dataset" button in sidebar

**Modal Layout:**
```
┌─────────────────────────────────────┐
│  Add New Dataset           [X]      │
├─────────────────────────────────────┤
│                                     │
│  What problem does this data solve? │
│  [Text input placeholder]           │
│                                     │
│  Who uses this data?                │
│  [Text input placeholder]           │
│                                     │
│  Upload CSV file:                   │
│  [Drag-and-drop area]               │
│  or [Click to browse]               │
│                                     │
│  Define success metrics (optional)  │
│  □ Adoption %                       │
│  □ Query volume                     │
│  □ Business impact ($)              │
│                                     │
│  [Cancel]  [Create Dataset]         │
└─────────────────────────────────────┘
```

**Interaction:**
- Drag-and-drop CSV upload
- Auto-detect schema (show column names + types)
- Progress bar while processing
- Success confirmation with link to view dataset

---

### 4. Chat Panel (Right Sidebar)

**Location:** Right side of main content, fixed/floating

**Layout:**
```
┌─────────────────────────────┐
│  Data Assistant     [−][×]  │  ← Chat header
├─────────────────────────────┤
│                             │
│ 📊 "What's our top segment? │
│                             │
│ 🤖 Based on the data, your │
│    top segment is:          │
│                             │
│    Enterprise customers     │
│    in North America         │
│                             │
│    • 42% of revenue         │
│    • $12.5M annual value    │
│    • 95% retention          │
│                             │
│    Consider focusing        │
│    retention efforts here.  │
│                             │
│                             │
│  [Input: Ask Claude...]     │
│  [Send button]              │
└─────────────────────────────┘
```

**Features:**
- Conversation history (scrollable)
- User messages (right-aligned, blue)
- Claude responses (left-aligned, white background)
- "Thinking..." loading state
- Input field with send button
- Minimize/maximize/close controls

---

### 5. Product Detail Page

**Route:** `/products/[id]`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Crystal  |  ← Back   Customer Revenue Dataset   │
├─────────────────────────────────────────────────┤
│                                                 │
│ Problem:  What's driving our customer value?   │
│ Owner:    Analytics Team                       │
│ Refresh:  Daily at 2 AM UTC                    │
│ Created:  Oct 15, 2024                         │
│                                                 │
├─────────────────────────────────────────────────┤
│ QUALITY METRICS                                 │
│                                                 │
│ Freshness:      ████░░ 95%  ✅ Updated 2h ago  │
│ Completeness:   █████░ 98%  (2 missing values) │
│ Accuracy:       ███░░░ 70%  (Inferred)         │
│                                                 │
├─────────────────────────────────────────────────┤
│ USAGE METRICS                                   │
│                                                 │
│ Queries/Day:    12 (↑ 20% from last week)     │
│ Unique Users:   5  (Finance + Product teams)   │
│ Adoption:       60% of org can access          │
│                                                 │
│ [30-Day Trend Chart]                           │
│                                                 │
├─────────────────────────────────────────────────┤
│ OUTCOME TRACKING                                │
│                                                 │
│ Hypothesis:  "Predicts customer LTV?"         │
│ Status:      Testing (Week 1 of 4)            │
│ Result:      TBD                               │
│ Impact:      If confirmed: $500K ARR impact    │
│                                                 │
├─────────────────────────────────────────────────┤
│ DATA LINEAGE                                    │
│                                                 │
│ [Raw Data] → [ETL] → [Transformation]         │
│     ↓         ↓            ↓                    │
│   S3      Python      Semantic Layer           │
│   Bucket   Script         ↓                    │
│                     [Customer Revenue Dataset]  │
│                           ↓                    │
│                  Used by: Finance Dashboard    │
│                           LTV Model            │
│                                                 │
│ [Edit] [Archive] [Delete]                      │
└─────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Nav
│   └── Account Dropdown
├── Sidebar
│   ├── NavLink (Dashboard)
│   ├── AddDatasetButton
│   ├── DatasetList
│   │   └── DatasetItem (multiple)
│   └── FilterControls
├── MainContent
│   ├── PageTitle
│   ├── ProductGrid
│   │   └── ProductCard (multiple)
│   │       ├── QualityMetrics
│   │       ├── UsageMetrics
│   │       ├── OutcomeScore
│   │       ├── AdoptionChart
│   │       ├── HypothesisTracker
│   │       └── CardActions
│   └── UploadModal
│       ├── FormField (multiple)
│       └── FileUpload
├── ChatPanel
│   ├── ChatHeader
│   ├── ConversationHistory
│   ├── Message (multiple)
│   └── ChatInput
└── Footer
    ├── Links
    └── Credits
```

---

## Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Page Title | Inter | 32px | 700 | 1.2 |
| Section Title | Inter | 20px | 600 | 1.3 |
| Card Title | Inter | 16px | 600 | 1.4 |
| Body Text | Inter | 14px | 400 | 1.5 |
| Small Text | Inter | 12px | 400 | 1.4 |
| Metric Numbers | Inter Mono | 24px | 700 | 1 |

**Font Family:** Inter (Google Fonts)

---

## Spacing & Sizing

**Spacing Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

**Container Widths:**
- Sidebar: 240px (fixed)
- Main content: calc(100% - 240px)
- Card width: 300px
- Modal width: 500px
- Chat panel: 350px

---

## Interactions & Animations

**Button Hover:**
- Primary button: Darken by 10%, shadow deepens
- Duration: 150ms
- Easing: ease-out

**Card Hover:**
- Shadow grows (0 → 8px offset)
- Transform: scale(1.01)
- Duration: 200ms

**Loading States:**
- Skeleton placeholders (animated pulse)
- Color: #E5E7EB (light gray)
- Pulse animation: 1.5s loop

**Chart Animations:**
- On load: Bars/line animate from 0 to final value
- Duration: 600ms
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

---

## Responsive Design

**Breakpoints:**
- Mobile: < 640px
  - Sidebar collapses to hamburger
  - Cards stack vertically (1 col)
  - Chat panel becomes bottom drawer
  
- Tablet: 640px - 1024px
  - Sidebar: 200px
  - Cards: 2 columns
  - Chat panel: right sidebar (300px)

- Desktop: > 1024px
  - Sidebar: 240px
  - Cards: 3 columns (if space)
  - Chat panel: 350px right sidebar

---

## Sample Data / Empty States

**Empty Dashboard:**
```
┌──────────────────────────────────────┐
│                                      │
│      📁 No datasets yet              │
│                                      │
│  Start by uploading your first CSV   │
│  to measure outcomes and track value │
│                                      │
│         [+ Add Dataset]              │
│                                      │
└──────────────────────────────────────┘
```

**Loading State:**
```
┌────────────────────────────────┐
│ ▮▮▮ Customer Revenue Dataset   │
├────────────────────────────────┤
│ Quality:   ░░░░░░░░░░ (loading) │
│ Usage:     ░░░░░░░░░░ (loading) │
│ Outcome:   ░░░░░░░░░░ (loading) │
└────────────────────────────────┘
```

---

## Accessibility

- **Color Contrast:** WCAG AA (4.5:1 minimum)
- **Focus States:** Visible keyboard focus rings (2px blue)
- **Alt Text:** All icons have aria-labels
- **Form Labels:** Associated with inputs via htmlFor
- **ARIA Roles:** Proper roles on custom components
- **Keyboard Navigation:** Tab through all interactive elements

---

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: #0066FF;
  --color-navy: #001A4D;
  --color-gray-light: #F5F7FA;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-text-dark: #1F2937;
  --color-text-light: #6B7280;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Typography */
  --font-family: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

---

## Next Steps

1. **Review this design** — Does it match your vision?
2. **Adjust colors/layout** — Any changes before coding?
3. **Create Figma/pen.dev mockup** (optional) — Visual prototype?
4. **Start Next.js build** — Convert design to components

---

**Design Status:** ✅ Ready for development  
**Last Updated:** Nov 5, 2026
