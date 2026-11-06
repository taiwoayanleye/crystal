# Crystal Dashboard — Design Prompt for pen.dev
## Think like a Staff Product Designer at Palantir Foundry

You are designing **Crystal**, an enterprise data-as-a-product dashboard. Think Palantir Foundry level of sophistication: data-forward, no fluff, every pixel earns its place.

---

## Design Context

**Product:** Crystal — Data-as-a-Product Dashboard  
**Use Case:** Enterprise data teams measuring whether datasets create business value  
**Target User:** a Product Owner (sophisticated, data-driven, expects enterprise quality)  
**Design Philosophy:** 
- Outcome-focused (metrics matter)
- Speed (scan-optimized)
- Enterprise (no decoration, high polish)
- Data-first (everything serves the data)
- Accessibility (WCAG AA minimum)

---

## Design System

**Color Palette:**
- Primary Blue: #0066FF (CTAs, active states)
- Navy: #001A4D (Headers, dark text)
- Success Green: #10B981 (Good metrics, quality scores)
- Warning Orange: #F59E0B (Medium metrics, caution)
- Error Red: #EF4444 (Poor metrics, errors)
- Text Dark: #1F2937 (Primary text)
- Text Light: #6B7280 (Secondary text)
- Background: #F5F7FA (Sidebar, subtle backgrounds)
- White: #FFFFFF (Cards, containers)
- Border: #E5E7EB (Subtle dividers)

**Typography:**
- Font Family: Inter (clean, modern, enterprise)
- Page Title: 32px / 700 weight
- Section Title: 20px / 600 weight
- Body: 14px / 400 weight
- Small: 12px / 400 weight
- Metric Numbers: 24px / 700 weight / Monospace (impact)

**Spacing Scale:** 4px, 8px, 16px, 24px, 32px, 48px  
**Border Radius:** 4px (small), 8px (cards), 12px (large)  
**Shadows:** sm (subtle), md (cards), lg (modals)

---

## 5 Key Screens to Design

### Screen 1: Dashboard Home (1440 × 900)
**Purpose:** Show overview of all data products with key metrics at a glance

**Layout:**
- Header (64px): Logo "Crystal" + navigation (Home, Docs, GitHub) + account dropdown
- Left Sidebar (240px): 
  - "📊 Dashboard" label
  - "+ Add Dataset" button (prominent blue CTA)
  - List of datasets (scrollable)
  - Sort/filter controls
- Main Content (1200px):
  - Title: "Data Products (3)"
  - 3-column grid of product cards
  - Chat panel on right (350px, persistent)

**Product Card Component (300 × 280):**
```
┌─────────────────────────────┐
│ 📊 Customer Revenue Dataset │
│                             │
│ Quality      ████░░ 85%    │ (Green progress bar)
│ Usage        ███░░░ 60%    │ (Blue progress bar)
│ Outcome Score ██░░░░ 40/100│ (Orange/Green progress bar)
│                             │
│ 💡 Hypothesis:              │
│ "Does this predict LTV?"    │
│ Status: Testing (Week 1)    │
│                             │
│ [View Details Button]       │
└─────────────────────────────┘
```

**Key Design Choices:**
- Progress bars for metrics (visual impact, scannable)
- 3 metrics per card (quality, usage, outcome)
- Hypothesis section shows what's being tested
- Cards in grid layout (Palantir-style)
- Subtle borders and shadows (not flashy)

---

### Screen 2: Product Detail Page (1440 × 1200)
**Purpose:** Deep dive into one dataset with all metrics, lineage, and hypothesis tracking

**Layout:**
- Header: Back button + "Customer Revenue Dataset" title
- Metadata bar: Problem statement, Owner, Refresh cadence, Created date
- Divider section
- Quality Metrics section:
  - Freshness (95%, updated 2h ago, green checkmark)
  - Completeness (98%, 2 missing values)
  - Accuracy (70%, inferred from patterns)
  - Each with progress bar
- Usage Metrics section:
  - 12 queries/day (↑20% from last week)
  - 5 unique users (list: Finance, Product)
  - 60% adoption of org
  - 30-day trend line chart
- Outcome Tracking section:
  - Hypothesis: "Does this predict customer LTV?"
  - Status: Testing (Week 1 of 4)
  - Result: TBD
  - Business Impact: "$500K ARR potential"
- Data Lineage section:
  - Flow: Raw Data → ETL → Transformation → Dataset → Usage
  - Show dependencies and downstream uses
  - Color-code by freshness status
- Action buttons: Edit, Archive, Delete

**Key Design Choices:**
- Vertical sectioning (clear scanning path)
- Metrics get their own dedicated space (importance)
- Chart integrated for usage trends
- Lineage as a flow diagram (not dense)
- Clear call-to-action buttons at bottom

---

### Screen 3: Upload/Add Dataset Modal (500 × 600)
**Purpose:** Simple, focused form to add a new dataset

**Layout:**
- Modal header: "Add New Dataset" + close button [×]
- Form fields:
  - Text input: "What problem does this data solve?"
  - Text input: "Who uses this?"
  - Drag-and-drop area: "Drag & Drop CSV Here" / "or Click to Browse"
  - Checkboxes (optional): "Define Success Metrics"
    - ☐ Adoption %
    - ☐ Query Volume
    - ☐ Business Impact ($)
- Action buttons: [Cancel] [Create Dataset]

**Key Design Choices:**
- Modal is focused and minimal (no distraction)
- Drag-and-drop prominent (common pattern)
- Checkboxes optional (keep it simple for MVP)
- Blue CTA button (consistent)
- Clear hierarchy (problem → user → file → optional metrics)

---

### Screen 4: Chat Panel (350 × 500)
**Purpose:** Claude AI assistant for asking questions about the data

**Layout:**
- Header: "Data Assistant" title + minimize [−] and close [×] buttons
- Conversation area:
  - User message (right-aligned, blue background): "What's driving our revenue?"
  - Claude response (left-aligned, light gray): "Your top segment is Enterprise customers in EMEA..."
  - Show reasoning and actionable insights
- Input area:
  - Text input field: "Ask Claude about this data..."
  - Send button [→]
- Loading state: "Thinking..." with animated dots

**Key Design Choices:**
- Conversation thread (not just Q&A)
- User messages right, Claude left (familiar chat pattern)
- Insights formatted clearly (bullet points, numbers in bold)
- Input always visible (sticky bottom)
- Loading state shows thinking (transparency)

---

### Screen 5: Data Lineage View (1440 × 600)
**Purpose:** Visualize the flow of data from source through transformation to usage

**Layout:**
- Title: "Data Lineage"
- Flow diagram (left to right):
  - Raw Data box: "S3 CSV, 1.2GB, ✓Fresh"
  - Arrow →
  - ETL box: "Python Script, updated hourly"
  - Arrow →
  - Transformation box: "Semantic Layer, 3 views"
  - Arrow →
  - Dataset box: "Customer Revenue Dataset"
  - Arrow ↓
  - Usage box: "Used By: Finance Dashboard, LTV Model, Forecasting"
- Legend at bottom:
  - ✓ Fresh (Green)
  - ⚠ Stale (Orange)
  - ✗ Error (Red)

**Key Design Choices:**
- Flow is left-to-right (natural reading direction)
- Boxes color-coded by status (not just labels)
- Dependencies clear (arrows show flow)
- Usage shows downstream impact
- Legend explains status colors

---

## Component Library (Create as Reusables)

**MetricCard:**
- Dimensions: 300 × 280px
- Background: White (#FFFFFF)
- Border: 1px #E5E7EB
- Corner Radius: 8px
- Padding: 12px
- Shadow: md

**ProgressBar:**
- Height: 6px
- Width: 276px (fills most of card)
- Background: #E5E7EB
- Fill colors: Green (quality), Blue (usage), Green/Orange (outcome)
- Corner Radius: 3px

**Button:**
- Primary: #0066FF bg, white text, padding 10px 16px, radius 8px
- Hover: Darken 10%, shadow grows
- Focus: 2px #0066FF outline

**TextInput:**
- Border: 1px #E5E7EB
- Padding: 10px 12px
- Border Radius: 6px
- Focus: 2px #0066FF border

**MessageBubble:**
- User: Right-aligned, #0066FF bg, white text, radius 12px
- Assistant: Left-aligned, #F3F4F6 bg, dark text, radius 12px
- Padding: 12px 16px

---

## Interaction & Animation Specs

**Hover States:**
- Cards: Scale 1.01 + shadow grows (200ms ease-out)
- Buttons: Darken by 10% + shadow deepens (150ms)
- Links: Underline appears (150ms)

**Loading States:**
- Skeleton: Animated pulse (#E5E7EB) looping 1.5s
- Progress: Bar fills smoothly (600ms cubic-bezier(0.34, 1.56, 0.64, 1))
- Chat: "Thinking..." with dot animation

**Focus States:**
- All interactive: 2px #0066FF outline
- Keyboard accessible (tab through everything)

---

## Responsive Design

**Mobile (< 640px):**
- Sidebar: Hamburger menu (collapsible)
- Cards: 1 column, full width
- Chat: Bottom drawer (modal-like)
- Font: -2px smaller

**Tablet (640-1024px):**
- Sidebar: 200px width
- Cards: 2 columns
- Chat: Right panel (300px)
- Spacing: Slightly reduced

**Desktop (> 1024px):**
- Full layout as specified
- 3-column grid
- 350px chat panel

---

## Accessibility Requirements

- **Color Contrast:** 4.5:1 minimum (WCAG AA)
- **Focus Indicators:** 2px border, visible
- **Alt Text:** All icons have aria-labels
- **Form Labels:** Associated with inputs
- **Keyboard Navigation:** Tab through all interactive
- **ARIA Roles:** Proper roles on custom components

---

## Design Principles to Follow

1. **Data First:** Every element serves the data, not decoration
2. **Enterprise:** Polish and reliability > trendy effects
3. **Foundry-Style:** Minimalist, outcome-focused, no fluff
4. **Scannable:** Metrics visible at a glance
5. **Interactive:** Smooth feedback on all actions
6. **Accessible:** Works for everyone, keyboard-friendly
7. **Responsive:** Same power on all devices

---

## Expected Output

Create 5 high-fidelity frames:
1. ✅ Dashboard Home
2. ✅ Product Detail
3. ✅ Upload Modal
4. ✅ Chat Panel
5. ✅ Data Lineage

Plus:
- ✅ Component library (MetricCard, ProgressBar, Button, etc)
- ✅ Design tokens (colors, typography, spacing)
- ✅ Interaction specs (hover, focus, loading states)
- ✅ Responsive mockups for mobile/tablet

---

## Design Brief Summary

You're designing a Palantir Foundry-style data dashboard for a sophisticated audience (a Product Owners). They don't need decoration—they need clarity, speed, and outcomes. Every pixel matters. The design should whisper "enterprise-grade" without screaming it.

Think: What would a Palantir designer create if they were measuring whether datasets create value?

**Result:** Crystal. Clean, powerful, outcome-focused.

---

## Next Steps

1. Design all 5 frames in pen.dev
2. Export design system
3. Create component library
4. Hand off to engineering for Next.js implementation

Good luck! Make it Foundry-level.
