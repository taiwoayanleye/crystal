# Crystal AI Development Context

## How to use this handoff

Both Codex and Claude Code must read this file with `AGENTS.md` before significant work. Update it after a significant task with evidence only: what changed, validation run, unresolved issues, and the next best step. Preserve other agents' in-progress notes.

_Last updated: 2026-11-06 by Codex._

## Current project status

Crystal is an implemented, deployed Next.js 14 (App Router) data-as-a-product dashboard backed by Neon Postgres.

- **Live:** https://crystal-eight-omega.vercel.app
- **Repo:** https://github.com/taiwoayanleye/crystal (public, git-connected to Vercel — pushes to `main` auto-deploy).
- **Env:** `DATABASE_URL` (Neon, via Vercel Marketplace) and `ANTHROPIC_API_KEY` are set in Vercel for Production/Preview/Development and pulled locally.

## In progress (uncommitted)

End-to-end UI critique and refinements are in the current working tree:

- Dashboard summary uses explicit product, quality, outcome-tracking, review, and source counts instead of a composite “health” score whose formula mixed quality with user-entered outcomes.
- Dataset cards label assistant-derived activity as illustrative and show outcomes as “Not started” rather than plotting a zero score.
- Detail page gives quality estimates their heuristic context; lineage now shows the observed source → ingestion → profile → product flow and intended audience, without inventing downstream dashboards or freshness states.
- Dashboard, detail, and assistant layouts are more responsive; the upload dialog has a clearer hierarchy, modal semantics, and associated labels; keyboard focus is visible globally.
- Local `npx tsc --noEmit` passes. Browser review succeeded after restarting duplicate Next.js dev servers: concurrent servers shared `.next`, leaving HTML references to missing client bundles and preventing hydration. One clean server now runs at `http://localhost:3000`. The pre-existing `design/crystal.pen` modification was preserved and not edited.

The AI-assisted upload flow — previously flagged here as "inferred from the diff, needs validation" — is now **implemented and validated**, and extended with AI name/emoji suggestion:

- `POST /api/analyze` returns a full analysis for a CSV schema + sample: `{ name, icon, problemStatement, users, metrics[] }`.
  - Validated: `curl` with Telco-shaped data returned name "Telco Customer Churn", icon "📉", a specific problem statement, users, and 4 column-aware metrics.
- The upload modal is now **AI-first**: a prominent gradient "Autofill with AI" button (enabled once a CSV is attached) fills the dataset name, emoji, problem statement, users, and auto-selects AI-suggested success metrics. A "Dataset name" field with an emoji preview was added.
- CSV (`/api/upload`) and PostgreSQL (`/api/connect`) both accept `name` + `icon` overrides; `saveDataset` uses the provided icon or falls back to a deterministic one.
- One-off data fix: the previously filename-named Telco dataset (`dataset_1793973348070`) was renamed in the DB to "Telco Customer Churn" / 📉 for dashboard consistency.

Historical validation when the AI upload flow was introduced: `npx tsc --noEmit` clean; `npx vitest run` = 20 passing; `npx next build` compiled; `/api/analyze`, `/api/connect`, `/api/datasets*`, `/api/chat` exercised locally. The AI upload change was committed as `4f4753a`.

## Recently completed (committed)

- `4bba12c`: unified CSV and PostgreSQL ingestion; added CSV connector, common persistence path, normalized source metadata, and last-sync timestamps. `npm test` passed (20 tests) and the production build passed before the commit; pushed to `main`.

- Dashboard portfolio summary strip added to `src/app/page.tsx`, following the five-metric design rhythm while using portfolio values supported by current data (health, product count, average quality, outcome tracking, and at-risk count). Health averages quality and user-entered outcome scores; no illustrative usage telemetry is presented as live. Visual review in the local browser confirmed the strip fits in five columns at desktop width and uses compact, consistent spacing/type. Automated tests were not run.

- `8be547b`: AI-suggested success metrics + upload-modal design alignment (now superseded/extended by `/api/analyze`).
- `69389ad`: source-aware/honest lineage + editable outcome tracking (PATCH).
- `3bb3925`: real sampled-data profiling + detail-page preview.
- `dade0d7`: PostgreSQL connector + source-type selector.
- `e61597b`: initial Crystal MVP dashboard.
- Pre-repo (same session): migrated in-memory store → Neon Postgres; end-to-end flow fixes; GitHub repo + Vercel git-connect; Vitest; README rewrite; scrubbed target-company references before going public.

## Files changed in the earlier AI-upload change set (historical)

- `src/lib/claude.ts` — `suggestSuccessMetrics` → `analyzeDataset` returning `{ name, icon, problemStatement, users, metrics }`; JSON-object parsing with forgiving extraction + no-key fallback.
- `src/app/api/analyze/route.ts` — **new** endpoint (replaces `suggest-metrics`).
- `src/app/api/suggest-metrics/route.ts` — **deleted**.
- `src/components/UploadModal.tsx` — AI-first layout, hero "Autofill with AI" button, Dataset name + emoji field, client-side CSV parse to feed `/api/analyze`, auto-select suggested metrics.
- `src/app/page.tsx` — pass `name`/`icon` (and `successMetrics`) to `/api/upload` and `/api/connect`.
- `src/app/api/upload/route.ts` — accept `name`/`icon`/`successMetrics` form fields.
- `src/app/api/connect/route.ts` — accept `name`/`icon`/`successMetrics`.
- `src/lib/database.ts` — `insertDataset`/`saveDataset` accept optional `icon`; `source_type` and `success_metrics` columns added via `ALTER ... IF NOT EXISTS` in bootstrap; `updateOutcome`; explicit-column reads.
- `src/lib/types.ts` — `Dataset` gained `sourceType` and `successMetrics`.

## Files changed in the current TAI-25/26 working tree

- `src/lib/connectors/csv.ts`, `src/lib/connectors/index.ts` — CSV connector and source-type factory.
- `src/lib/ingestion.ts` — common quality calculation and dataset persistence for connector results.
- `src/lib/connectors/postgres.ts`, `src/lib/connectors/types.ts` — normalized snapshot timestamps on ingest results.
- `src/lib/database.ts`, `src/lib/types.ts` — additive persisted `last_sync_at` field.
- Upload/connect routes, dataset APIs, and detail page — shared ingestion path and source/last-sync display.

## Architectural decisions

- Persistence is **Neon Postgres**, not SQLite. One `datasets` table; nested fields (schema/metadata/quality/outcome/success_metrics) and capped sample rows stored as JSONB.
- Neon client is **lazy** (init on first query, safe for `next build`) and uses **`fetch` `cache: 'no-store'`** to avoid stale reads after writes. List/detail reads select explicit columns and **exclude the heavy `rows` JSONB** (an oversized `SELECT *` silently dropped rows over Neon's HTTP driver).
- Source ingestion goes through a connector abstraction (`src/lib/connectors/`): `IDataConnector` + `IngestResult`. PostgreSQL is **snapshot-at-connect**; credentials are used once and **never stored**.
- CSV and PostgreSQL now share a connector factory and dataset persistence/quality-calculation path. Quality is calculated from the connector's capped sample; `last_sync_at` records snapshot completion separately from general `updated_at` edits.
- The detail page separates **real, data-derived** signals (quality, column profile, lineage, outcome) from **illustrative** ones (usage, 30-day trend), which are labeled as such.
- **Outcome** is a user-owned, editable record (PATCH `/api/datasets/[id]`), not an auto-inferred business result. Fresh uploads start "Not started / 0".
- AI runs **server-side** via Anthropic Messages API (`claude-opus-5-5`); keys stay in env vars. AI now powers chat, success-metric suggestions, and dataset name/emoji/problem/users autofill.
- Schema evolves via idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in the bootstrap path (runs once per process).

## Known bugs / technical debt

- No CI config or integration/API test suite yet; unit tests cover CSV parsing, metrics, and profiling (20 tests).
- CSV parser is a small custom implementation (handles quoted commas + empty-cell alignment); broaden coverage before treating as a full CSV implementation. Upload claims ".csv · up to 10MB"; .xlsx/.json from the original design are not implemented.
- Quality `freshness` is a fixed score for non-empty uploads; `accuracy` is heuristic — do not present as independently measured source facts.
- Usage + trend are deterministic illustrative values seeded by dataset ID (chat increments a persisted `usage_count`). Not real telemetry.
- Local dev and production share the **same Neon database** — local uploads/edits appear on the live demo. Consider a separate Neon dev branch.

## Outstanding work

- Enable "Autofill with AI" for **PostgreSQL** sources (needs a sample fetched after connecting; currently CSV-only — AI button hidden for Postgres).
- Review the TAI-25/TAI-26 implementation against Linear acceptance details. Real usage/trend telemetry remains outstanding; current usage/trend values are illustrative and outcome tracking remains manual.
- Replace illustrative usage/trend with real signals (wire usage to actual query activity; derive freshness from upload time).
- Phase 2 remaining connectors: Snowflake (TAI-22), BigQuery (TAI-23), cloud storage (TAI-27), plus backlog connectors and features.
- Add integration/API tests + CI; confirm model id and env config in all environments.
- Reconcile historical planning docs (Express/SQLite/Vite/Python mentions) with the actual Next.js/Neon architecture.
- TAI-20 outreach is drafted on the Linear issue but must be **sent by a human** — not an agent action.

## Next recommended step

Update the pen.dev source screens to match the revised product semantics. Keep outcome tracking manual and usage illustrative until real event sources exist.
