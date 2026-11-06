# Crystal Dashboard — Design Specification
## For pen.dev Implementation (Palantir Foundry Style)

**Status:** Ready for high-fidelity design in pen.dev  
**Target Audience:** Enterprise data teams (a Product Owner level)  
**Design Philosophy:** Foundry-inspired - data-first, no decoration, outcome-focused

---

## Frame 1: Dashboard Home (1440 x 900)

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Crystal [Logo]                    Home  Docs  GitHub │  64px Header
├────────┬──────────────────────────────────────────────┤
│        │ Data Products (3)                        [💬] │
│ 240px  │                                              │
│ Side   │ ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│ Bar    │ │Product 1 │  │Product 2 │  │Product 3 │   │
│        │ │Card      │  │Card      │  │Card      │   │ 280px height
│ • Dash │ │Quality   │  │Quality   │  │Quality   │   │
│ • Add  │ │Usage     │  │Usage     │  │Usage     │   │
│ • List │ │Outcome   │  │Outcome   │  │Outcome   │   │
│        │ └──────────┘  └──────────┘  └──────────┘   │
│        │                                              │
│        │ [Chat Panel on right - 350px]               │
└────────┴──────────────────────────────────────────────┘
```

### Header (Full width, 64px, #FFFFFF, 1px #E5E7EB border bottom)
- Logo + "Crystal" text (24px, #001A4D, bold)
- Navigation: Home | Docs | GitHub (13px, #6B7280)
- Account dropdown (right corner)

### Left Sidebar (240px, #F5F7FA, 1px #E5E7EB border right)
- "📊 Dashboard" label (14px, #1F2937, 500w)
- "+ Add Dataset" button (40px height, #0066FF, rounded 6px, white text)
- Dataset list:
  - • Customer Revenue (13px, #6B7280)
  - • Transactions
  - • Orders
- Sort/Filter controls at bottom

### Main Content (1200px wide, #FFFFFF)
- Title: "Data Products (3)" (28px, #001A4D, bold)
- 3-column grid with 24px gap
- Each card: 300px × 280px

### Product Card Component (300 × 280, white, 1px #E5E7EB, radius 8)
```
┌──────────────────────────────┐
│ 📊 Customer Revenue Dataset  │ ← 14px, 600w, #1F2937
│                              │
│ Quality        ████░░  85%   │ ← Progress bar: Green (#10B981)
│                              │
│ Usage          ███░░░  60%   │ ← Progress bar: Blue (#0066FF)
│                              │
│ Outcome Score  ██░░░░  40/100│ ← Progress bar: Orange (#F59E0B)
│                              │
│ 💡 Hypothesis:               │
│ "Does this predict LTV?"     │
│ Status: Testing (Week 1)     │
│                              │
│ ┌──────────────────────────┐ │
│ │  View Details (button)   │ │ ← Blue, 12px height
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Card Metrics:**
- Quality Bar: 276px wide, 6px height, green (#10B981) when good
- Usage Bar: Same, blue (#0066FF)
- Outcome Bar: Same, orange/green based on score > 50

---

## Frame 2: Product Detail Page (1440 × 1200)

### Layout
```
┌──────────────────────────────────────────────────────────┐
│ ← Back   Customer Revenue Dataset                        │ 56px
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Problem: What's driving customer value?                 │
│ Owner: Analytics Team | Refresh: Daily 2 AM UTC         │
│ Created: Oct 15, 2024                                   │
│                                                          │
│ ════════════════════════════════════════════════════════│
│ QUALITY METRICS                                          │
│                                                          │
│ Freshness      █████░ 95%  ✅ Updated 2h ago            │
│ Completeness   █████░ 98%  (2 missing values)           │
│ Accuracy       ███░░░ 70%  (Inferred from patterns)    │
│                                                          │
│ ════════════════════════════════════════════════════════│
│ USAGE METRICS (30-Day Trend)                             │
│                                                          │
│ Queries/Day    12 (↑ 20% from last week)                │
│ Unique Users   5  (Finance + Product teams)             │
│ Adoption       60% of org can access                    │
│                                                          │
│ [30-Day Trend Line Chart]                               │
│                                                          │
│ ════════════════════════════════════════════════════════│
│ OUTCOME TRACKING                                         │
│                                                          │
│ Hypothesis:  "Predicts customer LTV?"                   │
│ Status:      Testing (Week 1 of 4)                      │
│ Result:      TBD                                        │
│ Impact:      If confirmed: $500K ARR impact             │
│                                                          │
│ ════════════════════════════════════════════════════════│
│ DATA LINEAGE                                             │
│                                                          │
│ [Raw Data] → [ETL] → [Transformation] → [Dataset]      │
│    ↓         ↓             ↓                  ↓         │
│    S3     Python       Semantic         Customer Revenue│
│   Bucket  Script       Layer                ↓          │
│                                    ┌──────────────────┐ │
│                                    │ Used by:         │ │
│                                    │ • Finance Dash   │ │
│                                    │ • LTV Model      │ │
│                                    └──────────────────┘ │
│                                                          │
│ [Edit] [Archive] [Delete]                                │
└──────────────────────────────────────────────────────────┘
```

---

## Frame 3: Upload Modal (500 × 600)

### Layout
```
┌────────────────────────────────────┐
│ Add New Dataset          [×]        │ ← 20px modal
├────────────────────────────────────┤
│                                    │
│ What problem does this data solve? │
│ ┌──────────────────────────────┐  │
│ │ [Input field]                │  │ ← Text input
│ └──────────────────────────────┘  │
│                                    │
│ Who uses this?                     │
│ ┌──────────────────────────────┐  │
│ │ [Input field]                │  │
│ └──────────────────────────────┘  │
│                                    │
│ Upload CSV File                    │
│ ┌──────────────────────────────┐  │
│ │  Drag & Drop CSV Here        │  │ ← Drag zone
│ │  or Click to Browse          │  │
│ └──────────────────────────────┘  │
│                                    │
│ Define Success Metrics (optional)  │
│ ☐ Adoption %                       │
│ ☐ Query Volume                     │
│ ☐ Business Impact ($)              │
│                                    │
│ [Cancel]      [Create Dataset]     │ ← Blue CTA button
└────────────────────────────────────┘
```

---

## Frame 4: Chat Panel (350 × 500)

### Layout
```
┌────────────────────────────┐
│ Data Assistant    [−][×]   │ ← Header with controls
├────────────────────────────┤
│                            │
│ 📊 "What's driving revenue?"
│                            │
│ 🤖 Based on the data, your│
│    top segment is:         │
│                            │
│    Enterprise customers    │
│    in North America        │
│    • 42% of revenue        │
│    • $12.5M annual value   │
│    • 95% retention         │
│                            │
│    Consider focusing       │
│    retention efforts here. │
│                            │
│                            │
│ [Input: Ask Claude...]     │ ← Text input
│ [→ Send]                   │ ← Send button
└────────────────────────────┘
```

**Message Styles:**
- User message: Right-aligned, blue background (#0066FF), white text
- Claude message: Left-aligned, gray background (#F3F4F6), dark text
- Loading: "Thinking..." with animated dots

---

## Frame 5: Data Lineage View (1440 × 600)

### Layout
```
┌────────────────────────────────────────────────────────────┐
│ Data Lineage                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Raw Data]      [ETL]        [Transform]    [Dataset]   │
│  ┌────────┐     ┌────────┐   ┌───────────┐  ┌──────────┐│
│  │ S3 CSV │ --> │ Python │→→→│ Semantic  │→→│ Customer ││
│  │ 1.2GB  │     │ Script │   │ Layer     │  │ Revenue  ││
│  │✓Fresh  │     │        │   │ (3 views) │  │ Dataset  ││
│  └────────┘     └────────┘   └───────────┘  └────┬─────┘│
│                                                    │      │
│                                       ┌────────────┴─────┐│
│                                       │  Used By:        ││
│                                       │  • Finance Dash  ││
│                                       │  • LTV Model     ││
│                                       │  • Forecasting   ││
│                                       └──────────────────┘│
│                                                            │
│ Legend:                                                    │
│ ✓ Fresh (Green)  ⚠ Stale (Orange)  ✗ Error (Red)        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Component Library

### MetricCard (Reusable)
- Width: 300px, Height: 280px
- Background: #FFFFFF
- Border: 1px #E5E7EB
- Border Radius: 8px
- Padding: 12px
- Shadow: 0 4px 6px rgba(0,0,0,0.1)

### ProgressBar (Reusable)
- Height: 6px
- Border Radius: 3px
- Background: #E5E7EB
- Fill colors:
  - Quality: #10B981 (Green)
  - Usage: #0066FF (Blue)
  - Outcome: #10B981 (Green) if > 50, else #F59E0B (Orange)

### Button Styles
**Primary (CTA):**
- Background: #0066FF
- Color: #FFFFFF
- Padding: 10px 16px
- Border Radius: 6px
- Hover: Darken by 10%, shadow grows

**Secondary:**
- Background: #E5E7EB
- Color: #1F2937
- Padding: 10px 16px
- Border Radius: 6px

**Danger:**
- Background: #EF4444
- Color: #FFFFFF

---

## Design Tokens

**Colors:**
```
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

**Typography:**
- Font Family: Inter
- Page Title: 32px / 700 weight / 1.2 line-height
- Section Title: 20px / 600 weight / 1.3 line-height
- Body: 14px / 400 weight / 1.5 line-height
- Small: 12px / 400 weight / 1.4 line-height
- Metric Numbers: 24px / 700 weight (Monospace)

**Spacing:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

**Shadows:**
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.1)

**Border Radius:**
- sm: 4px
- md: 8px
- lg: 12px

---

## Interaction Patterns

**Hover States:**
- Buttons: Darken 10%, shadow deepens (150ms ease-out)
- Cards: Scale 1.01, shadow grows (200ms ease-out)
- Links: Underline appears (150ms)

**Loading States:**
- Skeleton: Animated pulse loop (1.5s), #E5E7EB background
- Progress: Smooth bar animation (600ms cubic-bezier)

**Focus States:**
- All interactive elements: 2px #0066FF outline
- Keyboard accessible throughout

---

## Responsive Design

**Mobile (< 640px):**
- Sidebar: Hamburger menu (collapse)
- Cards: 1 column stack
- Chat: Bottom drawer
- Font sizes: -2px across board

**Tablet (640px - 1024px):**
- Sidebar: 200px width
- Cards: 2 columns
- Chat: Right sidebar (300px)

**Desktop (> 1024px):**
- Full layout as specified
- Sidebar: 240px
- Cards: 3 columns
- Chat: 350px right panel

---

## Implementation Notes

1. **Use pen.dev components** for all reusable pieces
2. **Create shared library** for MetricCard, ProgressBar, Button
3. **Design tokens** should be exported as CSS variables
4. **Interaction specs** ready for Framer/Next.js implementation
5. **Mobile mockups** should mirror desktop but with responsive tweaks
6. **Accessibility** annotations included on every interactive element

---

**Design Ready for Development:** ✅  
Start with Frame 1 (Dashboard), then move to Product Detail, Upload Modal, Chat, and Lineage in pen.dev.
