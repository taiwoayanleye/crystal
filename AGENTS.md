# Crystal — Shared Agent Guide

## Purpose

Crystal is a data-as-a-product dashboard. It helps enterprise data teams treat each dataset as a product by showing its quality, illustrative usage, outcome hypothesis, lineage, and AI-assisted insights. The product is designed as an enterprise-grade portfolio/demo application with a Palantir Foundry-inspired visual system.

Read this file and [AI-CONTEXT.md](AI-CONTEXT.md) before starting any significant task. Then inspect the relevant implementation and source documentation; do not infer behavior from an old plan when the code says otherwise.

## Current technology stack

- Next.js 14 App Router, React 18, TypeScript
- Tailwind CSS 3, with project tokens in `tailwind.config.ts` and `src/styles/globals.css`
- Neon serverless Postgres (`@neondatabase/serverless`) for persistence
- `pg` for user-supplied PostgreSQL source connections
- Anthropic Messages API for the in-product data assistant and upload analysis
- Recharts for trend visualizations
- Vitest for unit tests
- Vercel is the intended deployment target

## Architecture

The browser renders client-side App Router pages and components. Route handlers provide the server boundary.

```text
Dashboard / detail UI
  -> /api/datasets, /api/upload, /api/connect, /api/chat, /api/analyze
  -> src/lib/{database,metrics,profile,claude,connectors}
  -> Neon Postgres datasets table (JSONB nested data and capped sample rows)
```

Key behavior:

- `src/lib/db.ts` lazily creates the Neon client so builds do not require `DATABASE_URL`; its fetches use `no-store`.
- `src/lib/database.ts` owns schema bootstrap, seed data, CRUD, and the capped stored sample rows. It persists `source_type` and `success_metrics` alongside each dataset.
- CSV upload parses and validates files, calculates quality metrics, and persists a dataset. PostgreSQL ingestion is snapshot-at-connect: credentials are used only for the request and are not stored.
- The detail API derives the real data profile, sample preview, and source-aware lineage from persisted data. Usage metrics/trend are intentionally deterministic illustrative values; chat increments a stored usage count.
- Outcome tracking is user-owned and editable through `PATCH /api/datasets/[id]`; do not imply that it is automatically measured.

## Important directories and files

```text
src/app/                  App Router pages, layout, and route handlers
src/app/api/              HTTP API: datasets, upload, connect, chat, analyze
src/components/           Reusable client UI components
src/lib/                  Domain logic, persistence, AI client, ingestion connectors
src/lib/connectors/       Source-agnostic connector interface and PostgreSQL connector
src/styles/globals.css    Global CSS and design tokens
design/                   Design system, screen specifications, and pen.dev source
product/                  Product vision and one-pager
*.md at root              Build history, roadmap, MVP checklist, and implementation notes
```

## Component and file organization

- Keep route handlers thin: validate request input, delegate to `src/lib`, and return explicit JSON errors/statuses.
- Put reusable UI in `src/components`; keep route-specific composition in `src/app`.
- Use the `@/*` import alias for `src/*` modules.
- Keep types close to shared domain logic in `src/lib/types.ts`; component-local API shapes may remain local when they are not reused.
- Extend ingestion through `IDataConnector` in `src/lib/connectors/types.ts`; keep the rest of the application source-agnostic.
- Preserve the distinction between facts derived from uploaded/connected data and illustrative/demo values in UI text and API responses.

## Coding and design conventions

- TypeScript is configured with `strict: false`; nevertheless, use clear types and avoid broad `any` where a useful shape is available.
- Use functional React components and hooks. Interactive pages/components require `'use client'`.
- Use Tailwind utility classes and the existing named tokens (`primary`, `navy`, `success`, `warning`, `error`, `text-*`, `bg-subtle`, `border`). Do not introduce arbitrary visual values when an existing token fits.
- Preserve the design system: Inter/system font stack, 4/8/16/24/32px spacing scale, 4/8/12px radii, and accessible focus states.
- Keep comments focused on non-obvious constraints or intent (for example, lazy DB initialization and credential handling).
- Never expose credentials in client code, logs, responses, fixtures, or documentation. PostgreSQL connection credentials must remain request-scoped.

## Testing and validation

Run the narrowest relevant validation first, then broader checks when changes warrant it:

```bash
npm test       # Vitest unit suite
npm run lint   # Next.js lint command configured by this repository
npm run build  # production build; needs valid environment/dependency conditions
npm run dev    # local development server
```

Add or update Vitest coverage for changes to parsers, metrics, profiles, connectors, and other deterministic library behavior. Test route/UI behavior proportionately when changing it. Report commands run and their outcome in the task handoff.

## Documentation map and precedence

Use these documents for intent, but reconcile them with the implementation:

- `README.md`: current product overview, setup, API summary, and high-level architecture.
- `AI-CONTEXT.md`: current handoff state and active/uncommitted work; update after significant work.
- `IMPLEMENTATION.md`, `BUILD.md`, `MVP-CHECKLIST.md`, `LINEAR-ROADMAP.md`: historical plans and roadmap. Several examples refer to Express, SQLite, Vite, or Python; these are not the implemented runtime architecture.
- `SKILL.md`: original build/design guide; treat technology examples as historical where they conflict with current code.
- `product/1-pager.md`: product framing and intended user value.
- `design/DESIGN-SPEC.md`, `design/design-system.md`, and `design/crystal.pen`: visual and interaction source of truth.

When documentation, code, and user direction conflict: follow explicit user direction, then existing behavior/architectural decisions, and update the affected documentation or explicitly flag the discrepancy. Never silently contradict a documented architectural decision.

## Working agreement for Codex and Claude Code

Before modifying files:

1. Read `AGENTS.md` and `AI-CONTEXT.md` for significant tasks.
2. Run `git status --short`; inspect relevant existing code, tests, and documentation.
3. Preserve all uncommitted work by other agents/users. Do not reset, checkout, discard, reformat wholesale, or overwrite files you have not first inspected.
4. Make the smallest scoped change that follows the established architecture and conventions. Avoid unrelated cleanup.

After a significant task:

1. Inspect the resulting diff and run relevant tests/validation.
2. Report what changed and the validation outcome.
3. Update `AI-CONTEXT.md` with completed work, material in-progress work, changed files, known issues, and a new architecture decision when one was made.

An architectural decision is significant when it changes persistence, API contracts, source ingestion, security/credential handling, data semantics, or a cross-cutting UI pattern. Record the decision and rationale in `AI-CONTEXT.md`; if it supersedes a project document, update that document as part of the same task or flag it clearly.

## Rules for modifying existing functionality

- Preserve public API contracts unless the task explicitly requires a coordinated change; update callers, tests, and documentation together when a contract changes.
- Keep database migrations additive and safe for existing rows, following the existing `ADD COLUMN IF NOT EXISTS` pattern where appropriate.
- Keep build-time safety: no environment-dependent client creation at module import time.
- Treat uploaded/connected data as untrusted input: validate files, request bodies, SQL identifiers, and bounds before use.
- Do not convert illustrative usage/trend values into claimed production telemetry without implementing and documenting a real event source.
- Do not change product/design requirements from planning docs without evidence or an explicit instruction.
