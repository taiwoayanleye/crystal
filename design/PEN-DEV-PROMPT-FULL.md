# Crystal Dashboard — Design Prompt for pen.dev
## Think like a Staff Product Designer at Palantir Foundry

**CONTEXT REFERENCES:**
- Project Structure: `/Users/t/Codes/labs/2026/crystal/`
- Product Vision: `/Users/t/Codes/labs/2026/crystal/product/1-pager.md`
- Design System Reference: `/Users/t/Codes/labs/2026/crystal/design/design-system.md`
- Detailed Layout Specs: `/Users/t/Codes/labs/2026/crystal/design/DESIGN-SPEC.md`
- the target company Context: `/Users/t/.claude/skills/career-ops/interview-prep/event-contacts-intel.md`
- Build Guide: `/Users/t/Codes/labs/2026/crystal/SKILL.md`

---

## Project Context

**Product Name:** Crystal  
**Full Name:** Crystal — Data-as-a-Product Dashboard  
**Target Company:** the target company (Product Owner - Digital Enablement role)  
**Target Contact:** a hiring contact  
**Timeline:** Deploy by end of next week (Nov 10-15, 2026)

**Product Vision (from 1-pager):**
Crystal demonstrates understanding of the target company's data-as-a-product framework. The dashboard shows:
1. Data quality metrics (freshness, completeness, accuracy)
2. Usage metrics (adoption %, queries/day, unique users)
3. Outcome measurement (is this data driving business decisions?)
4. AI chat assistant (Claude API for data insights)
5. Data lineage visualization (source → ETL → transformation → usage)

**Target User:** a Product Owner
- Sophisticated, data-driven
- 5+ years PM experience
- Expects enterprise-grade quality
- Understands data-as-a-product framework
- Values outcomes over features

---

## Design System (Reference: design-system.md)

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
- Page Title: 32px / 700 weight / 1.2 line-height
- Section Title: 20px / 600 weight / 1.3 line-height
- Body: 14px / 400 weight / 1.5 line-height
- Small: 12px / 400 weight / 1.4 line-height
- Metric Numbers: 24px / 700 weight / Monospace (impact)

**Spacing Scale:** 4px, 8px, 16px, 24px, 32px, 48px  
**Border Radius:** 4px (small), 8px (cards), 12px (large)  
**Shadows:**
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.1)

---

## 5 Key Screens to Design (Reference: DESIGN-SPEC.md for full details)

### Screen 1: Dashboard Home (1440 × 900)
**Purpose:** Show overview of all data products with key metrics at a glance  
**Reference:** DESIGN-SPEC.md → "Frame 1: Dashboard Home"

**Layout:**
- **Header (64px, white, 1px #E5E7EB border bottom)**
  - Logo: "Crystal" text (24px, navy #001A4D, bold)
  - Navigation: Home | Docs | GitHub (13px, text-light #6B7280)
  - Account dropdown (right corner)

- **Left Sidebar (240px, background #F5F7FA, 1px border right)**
  - "📊 Dashboard" label (14px, text-dark, 500w)
  - "+ Add Dataset" button (40px height, #0066FF blue, white text, radius 6px)
  - Dataset list:
    - • Customer Revenue (13px, text-light)
    - • Transactions
    - • Orders
  - Sort/Filter controls at bottom

- **Main Content Area (1200px, white)**
  - Title: "Data Products (3)" (28px, navy, bold)
  - 3-column grid of product cards (300×280 each, 24px gap)
  - Chat panel on right (350px, persistent)

**Product Card Component (300 × 280, white, 1px #E5E7EB border, radius 8px, padding 12px):**
```
┌─────────────────────────────┐
│ 📊 Customer Revenue Dataset │ ← 14px, 600w, text-dark
│                             │
│ Quality      ████░░  85%   │ ← Green bar (#10B981)
│ Usage        ███░░░  60%   │ ← Blue bar (#0066FF)
│ Outcome Score ██░░░░  40/100│ ← Orange/Green bar (#F59E0B or #10B981)
│                             │
│ 💡 Hypothesis:              │
│ "Does this predict LTV?"    │
│ Status: Testing (Week 1)    │
│                             │
│ [View Details Button]       │
└─────────────────────────────┘
```

**Metrics Details:**
- Quality Bar: 276px wide, 6px height, green (#10B981) when good
- Usage Bar: 276px wide, 6px height, blue (#0066FF)
- Outcome Bar: 276px wide, 6px height, color based on score (green if > 50, orange if <= 50)

---

### Screen 2: Product Detail Page (1440 × 1200)
**Purpose:** Deep dive into one dataset with all metrics, lineage, and hypothesis tracking  
**Reference:** DESIGN-SPEC.md → "Frame 2: Product Detail Page"

**Sections (top to bottom):**
1. Header: Back button + "Customer Revenue Dataset" title (28px, navy)
2. Metadata bar: Problem statement, Owner, Refresh cadence, Created date
3. Quality Metrics section:
   - Freshness: ████░░ 95% ✅ Updated 2h ago
   - Completeness: █████░ 98% (2 missing values)
   - Accuracy: ███░░░ 70% (Inferred from patterns)
4. Usage Metrics section:
   - 12 queries/day (↑20% from last week)
   - 5 unique users (Finance, Product teams)
   - 60% adoption of org
   - 30-day trend line chart (Recharts style)
5. Outcome Tracking:
   - Hypothesis: "Does this predict customer LTV?"
   - Status: Testing (Week 1 of 4)
   - Result: TBD
   - Business Impact: "$500K ARR potential"
6. Data Lineage:
   - Flow: [Raw Data] → [ETL] → [Transformation] → [Dataset] → [Usage]
   - Color-code by freshness status
7. Action buttons: [Edit] [Archive] [Delete]

---

### Screen 3: Upload/Add Dataset Modal (500 × 600)
**Purpose:** Simple, focused form to add a new dataset  
**Reference:** DESIGN-SPEC.md → "Frame 3: Upload Modal"

**Modal Layout:**
- Header: "Add New Dataset" [×] close button
- Form Fields:
  - Label: "What problem does this data solve?"
    - Text input, placeholder text
  - Label: "Who uses this?"
    - Text input, placeholder text
  - Label: "Upload CSV File"
    - Drag-and-drop zone (400px × 120px)
    - Text: "Drag & Drop CSV Here" / "or Click to Browse"
  - Label: "Define Success Metrics (optional)"
    - ☐ Adoption %
    - ☐ Query Volume
    - ☐ Business Impact ($)
- Buttons: [Cancel] [Create Dataset] (blue CTA)

---

### Screen 4: Chat Panel (350 × 500)
**Purpose:** Claude AI assistant for asking questions about the data  
**Reference:** DESIGN-SPEC.md → "Frame 4: Chat Panel"

**Component:**
- Header (50px): "Data Assistant" title + [−] minimize [×] close
- Conversation Area (scrollable):
  - User message (right-aligned):
    - Background: #0066FF (blue)
    - Text: white
    - Radius: 12px
    - Padding: 12px 16px
    - Example: "What's driving our revenue?"
  - Claude response (left-aligned):
    - Background: #F3F4F6 (light gray)
    - Text: #1F2937 (dark)
    - Radius: 12px
    - Padding: 12px 16px
    - Example: "Your top segment is Enterprise customers in EMEA... 42% of revenue, $12.5M annual value, 95% retention. Consider focusing retention efforts here."
- Input Area (sticky bottom):
  - Text input: "Ask Claude about this data..."
  - Send button: [→]
- Loading State:
  - Text: "Thinking..."
  - Animated dots (. .. ...)

---

### Screen 5: Data Lineage View (1440 × 600)
**Purpose:** Visualize the flow of data from source through transformation to usage  
**Reference:** DESIGN-SPEC.md → "Frame 5: Data Lineage View"

**Flow Diagram (left to right):**
```
[Raw Data]  →  [ETL]  →  [Transform]  →  [Dataset]  →  [Usage]
  S3 CSV        Python      Semantic      Customer        Finance
  1.2GB         Script      Layer         Revenue         Dashboard
  ✓Fresh        hourly      3 views       ↓              LTV Model
                                          Used By:        Forecasting
                                          (shown below)
```

**Components:**
- Raw Data box: "S3 CSV, 1.2GB, ✓Fresh"
- ETL box: "Python Script, updated hourly"
- Transformation box: "Semantic Layer, 3 views"
- Dataset box: "Customer Revenue Dataset"
- Usage box: "Used By: Finance Dashboard, LTV Model, Forecasting"
- Legend at bottom: ✓ Fresh (Green), ⚠ Stale (Orange), ✗ Error (Red)

---

## Component Library (Create as Reusables)

**MetricCard** (used in Dashboard)
- Dimensions: 300 × 280px
- Background: #FFFFFF
- Border: 1px #E5E7EB
- Corner Radius: 8px
- Padding: 12px
- Shadow: md

**ProgressBar** (used throughout for metrics)
- Height: 6px
- Width: 276px
- Background: #E5E7EB
- Fill colors:
  - Quality: #10B981 (Green)
  - Usage: #0066FF (Blue)
  - Outcome: #10B981 (if > 50) or #F59E0B (if <= 50)
- Corner Radius: 3px

**Button - Primary**
- Background: #0066FF
- Color: #FFFFFF
- Padding: 10px 16px
- Border Radius: 8px
- Font: 14px, 500 weight
- Hover: Darken 10%, shadow grows (150ms ease-out)
- Focus: 2px #0066FF outline
- Disabled: opacity 50%

**Button - Secondary**
- Background: #E5E7EB
- Color: #1F2937
- Padding: 10px 16px
- Border Radius: 8px

**Button - Danger**
- Background: #EF4444
- Color: #FFFFFF
- Padding: 10px 16px
- Border Radius: 8px

**TextInput**
- Border: 1px #E5E7EB
- Padding: 10px 12px
- Border Radius: 6px
- Font: 14px, 400 weight
- Focus: 2px #0066FF border
- Placeholder: text-light (#6B7280)

**MessageBubble**
- User message:
  - Background: #0066FF
  - Color: #FFFFFF
  - Border Radius: 12px
  - Padding: 12px 16px
  - Alignment: right
- Assistant message:
  - Background: #F3F4F6
  - Color: #1F2937
  - Border Radius: 12px
  - Padding: 12px 16px
  - Alignment: left

---

## Interaction & Animation Specs

**Hover States:**
- Cards: Scale 1.01, shadow deepens (200ms ease-out)
- Buttons: Darken 10%, shadow grows (150ms ease-out)
- Links: Underline appears (150ms ease-out)

**Loading States:**
- Skeleton placeholder: Animated pulse (#E5E7EB), 1.5s loop
- Progress bar: Smooth fill (600ms cubic-bezier(0.34, 1.56, 0.64, 1))
- Chat: "Thinking..." with animated dots

**Focus States:**
- All interactive elements: 2px #0066FF outline
- Keyboard navigation: Tab through all interactive elements
- Focus visible on buttons, links, inputs

---

## Responsive Design

**Mobile (< 640px):**
- Sidebar: Hamburger menu (collapse to icon)
- Cards: 1 column, full width with 16px margins
- Chat: Bottom drawer (modal-like)
- Font sizes: -2px across board
- Header: Adjust padding

**Tablet (640-1024px):**
- Sidebar: 200px width
- Cards: 2 columns
- Chat: Right panel (300px)
- Spacing: Slightly reduced (12px instead of 16px)

**Desktop (> 1024px):**
- Full layout as specified
- Sidebar: 240px width
- Cards: 3 columns with 24px gap
- Chat: 350px right panel
- Spacing: Full 16px+

---

## Accessibility Requirements

- **Color Contrast:** 4.5:1 minimum (WCAG AA)
- **Focus Indicators:** 2px border, clearly visible
- **Alt Text:** All icons have aria-labels
- **Form Labels:** Associated with inputs via htmlFor
- **Keyboard Navigation:** Tab through all interactive elements
- **ARIA Roles:** Proper roles on custom components
- **Error Messages:** Clear, helpful, color + icon (not just color)

---

## Design Principles to Follow

1. **Data First:** Every element serves the data, not decoration
2. **Enterprise:** Polish and reliability > trendy effects
3. **Foundry-Style:** Minimalist, outcome-focused, no fluff
4. **Scannable:** Metrics visible at a glance (no scrolling needed)
5. **Interactive:** Smooth feedback on all actions
6. **Accessible:** Works for everyone, keyboard-friendly
7. **Responsive:** Same power on all devices

---

## Design Philosophy

Think like a Palantir Foundry designer:
- **What would a Palantir designer create if measuring whether datasets create value?**
- Answer: Crystal. Clean, powerful, outcome-focused.
- Every pixel earns its place.
- The design should whisper "enterprise-grade" without screaming it.
- Data teams don't need decoration—they need clarity, speed, and outcomes.

---

## Expected Output

Create 5 high-fidelity frames (at 1440×900 for desktop):
1. ✅ Dashboard Home
2. ✅ Product Detail
3. ✅ Upload Modal
4. ✅ Chat Panel
5. ✅ Data Lineage

Plus:
- ✅ Component library (MetricCard, ProgressBar, Button variants, TextInput, MessageBubble)
- ✅ Design tokens (colors, typography, spacing, shadows)
- ✅ Interaction specs (hover, focus, loading, active states)
- ✅ Responsive mockups (mobile/tablet/desktop)
- ✅ Accessibility annotations

---

## Next Steps After Design

1. Export design system from pen.dev
2. Create component library specs
3. Hand off to engineering for Next.js implementation at: `/Users/t/Codes/labs/2026/crystal/engineering/`
4. Deploy to Vercel by Nov 10-15
5. Reach out to a hiring contact at the target company with live demo link

---

## Timeline Context

- **Now:** Nov 5, 2026 (Design phase)
- **Target:** Deploy by Nov 10-15, 2026 (5-6 days)
- **Application deadline:** Early next week (Nov 11-13)
- **Contact:** a hiring contact at the target company (met at event)

---

**Make it Foundry-level. Every pixel matters.**
