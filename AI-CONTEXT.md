# Crystal AI Development Context

## How to use this handoff

Both Codex and Claude Code must read this file with `AGENTS.md` before significant work. Update it after a significant task with evidence only: what changed, validation run, unresolved issues, and the next best step. Preserve other agents' in-progress notes.

_Last updated: 2026-11-06 by Codex (implemented the V2 interface from the Pencil source)._

## Handoff snapshot

- **Done:** V2 homepage at `/`, portfolio dashboard at `/dashboard`, detail pages at `/detail/[id]`; links and detail-page return/add actions use the new routes. Production was built and verified at the live URL.
- **In progress:** None. The homepage/dashboard route work is committed and pushed; no pending implementation changes are known.
- **Next:** Review the homepage, dashboard, and assistant at mobile/tablet widths. Preserve the honest-data rules: outcomes are manually tracked, usage/trend are illustrative, and lineage only shows observed processing plus an explicitly unconnected audience.

## Completed — Homepage route from the V2 design (2026-11-06)

The V2 `Homepage` frame (`PvWu6`) is implemented at `/`. It provides the Crystal wordmark, Docs/GitHub/Changelog links, hero headline and description, Dashboard and Docs calls to action, and a portfolio snapshot. The three snapshot values are derived from `/api/datasets` (count, average quality estimate, and total rows), rather than hard-coded. The portfolio dashboard now lives at `/dashboard`; dashboard cards still open `/detail/[id]`, and detail-page return/add actions now route back to `/dashboard`.

Validation: `npx tsc --noEmit` and `npm run build` passed. Browser review confirmed the homepage layout, populated portfolio stats, and navigation to `/dashboard`; production at https://crystal-eight-omega.vercel.app serves the new homepage, and `/dashboard` serves the portfolio view. No unit tests were run. Changed files: `README.md`, `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/detail/[id]/page.tsx`, `src/app/layout.tsx`, and this handoff.

## Current project status

Crystal is an implemented, deployed Next.js 14 (App Router) data-as-a-product dashboard backed by Neon Postgres.

- **Live:** https://crystal-eight-omega.vercel.app
- **Repo:** https://github.com/taiwoayanleye/crystal (public, git-connected to Vercel — pushes to `main` auto-deploy).
- **Env:** `DATABASE_URL` (Neon, via Vercel Marketplace) and `ANTHROPIC_API_KEY` are set in Vercel for Production/Preview/Development and pulled locally.

## Completed — `design/crystal.pen` V2 semantic alignment (2026-11-06)

The committed `design/crystal.pen` V2 redesign has top-level frames `PvWu6` Homepage, `nEmo8` Dashboard V2, `JyQE0` Detail V2, `kFhfe` Data Lineage V2, `Hqq4n` Upload Modal V2, `V7xjvu` Chat Panel V2, `tPm9N` Components; V2 components `kNzDk` ProgressBar, `WVfpO`/`LZDfw`/`aptDT` Buttons, `GSxG1` MetricCard. Preserve it — do not revert. (Inspect with the pencil `execute` tool; `Get('<id>')` returns the subtree, and a `throw new Error(JSON.stringify(...))` is the read channel. `Update('<id>', {content:'...'})` edits a node.)

Updated the V2 designs to match the implemented product and preserve the distinction between observed data and illustrative/demo information:

- **Data Lineage V2 (`kFhfe`)** — changed to observed-only: `Data flow` → Source → Ingestion → Profile → Data product. Source reports CSV upload, 7,043 rows, and 21 columns; ingestion reports CSV connector, on-upload trigger, and 500-row stored sample; profile reports 500 sampled rows and a 21-column schema; data product shows its name, estimated quality, and row count. Removed unverified source infrastructure, runtime/schedule/duration claims, stage-status badges, downstream consumer cards, and freshness legend. Replaced the consumer section with the intended Sales audience and an explicit not-connected label.
- **MetricCard V2 (`GSxG1`)** — changed `Usage` to `Demo activity index` and removed the unsupported `HEALTHY` composite-health badge.
- **Upload Modal V2 (`Hqq4n`)** — added `Define Success Metrics (optional)`, the three default metric options, and an `AI-suggested for this data` affordance with sample churn/retention suggestions. Resized and tightened the modal so fields and footer fit without clipping.
- **Dashboard V2 (`nEmo8`)** — added the missing `Needs review` KPI and aligned all card activity labels to `Demo activity index`.
- **Detail V2 (`JyQE0`)** and **Chat Panel V2 (`V7xjvu`)** remain aligned with the current implemented semantics.

Validation: inspected Pencil screenshots for `kFhfe`, `GSxG1`, `Hqq4n`, and `nEmo8`; Pencil layout diagnostics reported no clipped or overflowing nodes in these frames after adjustment. The design and handoff were committed in `14094fb` (`Align Crystal V2 design with observed data`) as Taiwo Ayanleye, with no AI/co-author trailer.

## Completed — V2 interface implementation (2026-11-06)

Implemented the V2 visual system in the app based on the committed Pencil frames:

- Replaced the global header with the shared left sidebar, added dashboard portfolio summary, searchable product cards, and responsive dashboard layout.
- Updated cards to the reference CTA layout: prominent quality score, three metric bars, hypothesis in a soft neutral footer, black **View** action, and neutral **Ask** chat action.
- Applied V2 typography, neutral surfaces, dark primary actions, spacing, and borders to dashboard, detail, upload modal, chat panel, and lineage.
- Updated detail layout while preserving real data profile/sample, manual outcome editing, and appropriately labeled illustrative activity. Data flow displays the observed source → ingestion → profile → data product steps and intended audience with a `Not connected` label; it does not imply downstream integrations.
- Set upload success-metric defaults as selected and restyled the CSV/AI/PostgreSQL form and create action to match V2.
- Replaced chat auto-scroll via `scrollIntoView` with scroll-container positioning after the integrated browser surfaced a runtime error when opening the Ask CTA.

Changed files: `src/app/page.tsx`, `src/app/detail/[id]/page.tsx`, `src/components/{Button,ChatPanel,LineageFlow,MetricCard,ProgressBar,Sidebar,UploadModal}.tsx`, `src/styles/globals.css`, and `tailwind.config.ts`.

Validation: `npx tsc --noEmit` passed; `git diff --check` passed. Browser review confirmed the dashboard, card CTAs, detail page, four-step lineage, and upload modal. Opened **Ask** from a dashboard card after the scroll fix; the assistant rendered without a Next.js runtime error. Unit tests were not run.

## Resolved local browser issue

- Two Next.js dev servers had been writing to the same `.next` directory, leaving stale client bundle references and a permanently loading browser UI. Both were stopped and a single dev server was restarted at `http://localhost:3000`; dashboard and detail pages then rendered successfully. Avoid running multiple dev servers for this checkout at once.
- The user's V2 redesign in `design/crystal.pen` was preserved and continued via Pencil execute, then committed as `14094fb`; unrelated design content was left intact.

The AI-assisted upload flow — previously flagged here as "inferred from the diff, needs validation" — is now **implemented and validated**, and extended with AI name/emoji suggestion:

- `POST /api/analyze` returns a full analysis for a CSV schema + sample: `{ name, icon, problemStatement, users, metrics[] }`.
  - Validated: `curl` with Telco-shaped data returned name "Telco Customer Churn", icon "📉", a specific problem statement, users, and 4 column-aware metrics.
- The upload modal is now **AI-first**: a prominent gradient "Autofill with AI" button (enabled once a CSV is attached) fills the dataset name, emoji, problem statement, users, and auto-selects AI-suggested success metrics. A "Dataset name" field with an emoji preview was added.
- CSV (`/api/upload`) and PostgreSQL (`/api/connect`) both accept `name` + `icon` overrides; `saveDataset` uses the provided icon or falls back to a deterministic one.
- One-off data fix: the previously filename-named Telco dataset (`dataset_1793973348070`) was renamed in the DB to "Telco Customer Churn" / 📉 for dashboard consistency.

Historical validation when the AI upload flow was introduced: `npx tsc --noEmit` clean; `npx vitest run` = 20 passing; `npx next build` compiled; `/api/analyze`, `/api/connect`, `/api/datasets*`, `/api/chat` exercised locally. The AI upload change was committed as `4f4753a`.

## Recently completed (committed)

- `77b079c`: end-to-end portfolio UI refinements, pushed to `main` as Taiwo Ayanleye. Dashboard summary now uses explicit portfolio counts (the earlier composite Health score was removed); cards show source/snapshot metadata and distinguish demo activity and unstarted outcomes; detail quality estimates are explained; lineage no longer implies unconnected downstream dashboards; responsive layouts and upload-dialog accessibility were improved. `npx tsc --noEmit` and `git diff --check` passed. Browser review confirmed dashboard and detail rendering after the dev-server restart; tests were not run for this design task.
- `4bba12c`: unified CSV and PostgreSQL ingestion; added CSV connector, common persistence path, normalized source metadata, and last-sync timestamps. `npm test` passed (20 tests) and the production build passed before the commit; pushed to `main`.

- Earlier portfolio summary strip added to `src/app/page.tsx`; the composite Health value was superseded by explicit portfolio counts in `77b079c` because it mixed quality estimates with user-entered outcome scores.

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
- The detail page separates source/sample-derived data (schema, sample profile, last-sync timestamp) from heuristic quality estimates, illustrative usage/trend, and user-owned outcomes; each is labeled according to its evidence source.
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

Review the V2 interface at mobile and tablet widths, especially the sidebar replacement, five-item portfolio strip, and assistant panel. Keep outcome tracking manual and usage/activity illustrative until real event sources exist.

### Separately (product backlog, not the design task)

Enable "Autofill with AI" for PostgreSQL sources; migrate remaining Phase 2 connectors (Snowflake TAI-22, BigQuery TAI-23, cloud storage TAI-27); replace illustrative usage/trend with real signals; add integration tests + CI.
