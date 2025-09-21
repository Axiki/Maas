# Agent Activity Log

## 2024-11-24 Initial Audit
- Reviewed `prompt.md` (suite spec) to capture MAS MVP scope, acceptance criteria, and app lineup.
- Inspected current React/Vite project (`src/App.tsx`, `components/apps`, `stores`, `config`, `data`) to understand implemented scope.
- Logged current functionality: mocked auth login, launcher grid with GSAP/Framer Motion, POS catalogue/cart with mock data, paper shader WebGL pass, Zustand stores for auth/offline/cart.
- Highlighted missing areas: all other apps are placeholders; no backend or API; limited offline buffer; theme tokens not fully wired; security, observability, accessibility, and testing absent.

## 2024-11-24 Planning Prep
- Created internal planning checklist via CLI plan tool to track: audit -> roadmap drafting -> delegation.
- Confirmed tooling stack already available (Tailwind, Framer Motion, GSAP, Zustand, localforage, Three.js) and gaps versus MAS specification.

## 2024-11-24 Backend Spec Alignment
- Analyzed `prompt-backend.md` (authoritative product prompt) and reconciled it with earlier findings.
- Confirmed required app shells: `/portal`, `/pos`, `/backoffice`, `/kds`, `/calendar`, plus business-critical tiles (`/products`, `/inventory`, `/purchasing`, `/customers`, `/promotions`, `/reports`, `/accounting`, `/imports`, `/devices`).
- Captured backend mandates: NestJS/Express API with Prisma (SQLite dev, Postgres prod via Supabase), multi-tenant scoping, RBAC, audit logging, JWT + refresh, POS PIN + 2FA, WebSockets (sales/KDS/inventory), REST contracts with idempotency keys for orders/payments, observability (logs/metrics/traces, incident IDs), Supabase storage for assets, rate limiting, optional backoffice IP allowlist.
- Noted operational constraints: POS-only offline buffer (IndexedDB stores `catalog_vX`, `orders_queue`, `recent_orders`), 1 register per location MVP, never attempt card capture offline, payment/printing behind adapters, paper shader budget <= 2ms, performance targets (POS cold load <= 2s, search < 100ms, add-to-cart <= 150ms).
- Identified additional frontend behaviours demanded by prompt-backend: manager approval PIN modals, discounts/charges gating, tips/service/minimum charges, split/partial payments, returns/exchanges, loyalty points and gift cards, promotions stackability UI, barcode scanning (continuous HID), priced-by-weight entry with tare, table map with merge/split, FEFO prompts, KDS bump/recall, calendar-to-POS linkage, settings switchboard, installable PWAs, accessibility/i18n readiness.

## 2024-11-24 Roadmap Finalization
- Produced consolidated roadmap incorporating both prompts, prioritising front-end foundation before backend services, then domain apps, followed by QA/operations.
- Defined delegation lanes (Frontend Core, Backend & Sync, Domain Apps, Quality/Ops) with integration checkpoints (design tokens, API contracts, offline sync dry-runs, accessibility reviews).

---

## Current State vs Spec — Gap Summary
- **Architecture & Repo**: single Vite app vs required monorepo (`apps/`, `packages/`), no Turborepo, no environment scaffolding, no Supabase integration.
- **Design System**: tokens defined but not applied through Tailwind CSS variables; dark theme absent; typography and motion specs partially implemented; paper shader lacks runtime controls.
- **Authentication & Security**: no real auth, RBAC, 2FA, POS PIN flows, audit logs, tenant scoping, or observability wiring.
- **POS Experience**: missing modifiers UI, combos, discounts/charges rules, split payments, loyalty/promos, returns/exchanges, table map, receipts (print/email/QR), cash management, hardware adapters, offline conflict handling.
- **Supporting Apps**: KDS, catalog/products, inventory, purchasing, customers, promotions, reports, calendar, accounting, imports, devices, backoffice settings all unbuilt.
- **Backend Services**: API, database schema, sync endpoints, WebSockets, Supabase storage, CSV import/export pipeline, rate limiting, deployment scripts not present.
- **Quality & Ops**: no automated tests, accessibility/i18n coverage, seed scripts, documentation, CI/CD, observability dashboards.

---

## Frontend Delivery Plan (build order)
- **Monorepo & Tooling Foundation**
  - Adopt Turborepo; restructure into `apps/{portal,pos,backoffice,kds,calendar,...}` and `packages/{ui,shared,api,config}`; migrate current code into `apps/portal` and reusable packages.
  - Implement shared TypeScript config, linting, formatting, testing presets; establish environment handling (.env.local per app, shared secret loader).
  - Integrate Tailwind with design tokens (CSS variables for light/dark), Inter typography (tabular numbers), motion durations, radii; publish via `@mas/tokens` package.
  - Build `@mas/ui` kit (nav rail, pill buttons, cards, tabs, tables, form controls, skeletons, glass overlays) with accessible patterns and Framer Motion presets.
  - Configure global app shell utilities: React Router per app, TanStack Query for data fetching, Zustand slices by domain, error boundary with incident ID display, theme/paper shader toggles.

- **Portal & Navigation**
  - Enhance launcher grid with role-aware tiles, favorites, notification badges, offline/PWA indicators, search/filter; add cross-app switcher overlay.
  - Implement user/tenant menu (profile, store switch, theme and paper shader controls, incident reporting, logout) with audit log link for managers.

- **POS (PWA) Build-Out**
  - Catalogue browser: live data from IndexedDB and API, category tabs with GSAP stagger, modifier and combo selection, variant handling, priced-by-weight input with tare, barcode scanning (continuous HID plus manual lookup).
  - Cart and order management: quantity long-press, split/partial payments (cash/card/store credit), discounts/promos with manager gating, tips/service/minimum charges, loyalty/gift card redemption, per-seat assignments.
  - Table management: map with merge/split, status colours, course firing ("Fire Appetizers"), waiter view, reservation linkage.
  - Tickets lifecycle: hold/resume multiple named tickets persisted offline; returns/exchanges referencing prior orders; manager PIN approval flow.
  - Checkout and receipts: integrate payment adapters (mock for MVP), enforce no card capture offline; generate printable/email/QR receipts, gift receipt option; cash drawer kick, pay-in/out flows, blind close support.
  - Offline UX: status pill updates, queued orders list with retry/cancel, conflict resolution messaging, catalog freshness indicator.

- **Supporting App Shells**
  - **KDS**: multi-lane ticket board, station filters, bump/recall, rush filter, audio cues, offline fallback messaging, WebSocket updates.
  - **Backoffice**: dashboard plus settings sections (tenant/company, branding, theme tokens, paper shader controls, taxes/charges, roles/permissions switchboard with thresholds, notifications, device registry, audit log viewer).
  - **Products**: CRUD for categories/products/variants/modifier groups/price lists/schedules, image upload preview (Supabase signed URLs), station and printer routing.
  - **Inventory**: stock levels by store, batch/expiry lists, FEFO prompts, adjustments, transfers, wastage, cycle counts with CSV import and approval workflow.
  - **Purchasing**: suppliers, PO lifecycle (create -> approve -> email PDF), GRN with batch capture and cost updates, supplier invoices, cost history log.
  - **Customers**: profiles, tags, loyalty earn/burn rules, store credit management, gift card issuance/redemption history.
  - **Promotions**: rule builder (percent/amount/BXGY/bundle) with constraint UI (date/time, stores, customer groups, redemption caps) and stackability controls.
  - **Reports**: dashboards (sales, inventory, purchasing, loyalty), filters (date/store/cashier), export triggers with job status, incident ID display on failures.
  - **Calendar**: month/week/day views, drag-to-create events (reservations, counts, PO arrivals, tasks), reminders, POS linkage for reservations.
  - **Accounting**: daybook, tax payable, COGS snapshot (avg/FIFO), mini P&L, cash management (float, pay-in/out, reconciliation), export buttons.
  - **Imports**: guided CSV uploads, column mapping UI, dry-run validator, error CSV download, commit confirmation with created/updated counts.
  - **Devices**: register pairing, printer/scanner configuration, firmware/version banners, diagnostics (connectivity, time drift) with test triggers.

- **Accessibility, i18n, PWA**
  - Integrate i18n framework (for example i18next) with locale bundles, RTL support, number/date formatting; ensure keyboard flows and focus rings across apps.
  - Configure POS and KDS as installable PWAs with service worker strategies aligned to offline buffer; handle updates gracefully (toast plus refresh prompt).

- **Frontend QA & Documentation**
  - Implement component/unit tests (Vitest plus Testing Library), integration tests, Cypress E2E scenarios aligned to acceptance list (POS sale, offline sync, GRN, promo matrix, reservation to POS, switchboard enforcement).
  - Add visual regression coverage (Storybook plus Chromatic or alternative) for key components.
  - Produce frontend developer docs (architecture, coding standards, token usage) and operator guides (portal navigation, POS workflow, KDS, backoffice settings, imports, paper shader controls).

---

## Backend Delivery Plan (parallel track)
- **Platform & Infrastructure**
  - Scaffold NestJS (preferred) or Express server in `apps/server`; integrate Prisma with schema covering tenants, stores, registers, users, roles, permissions, audit logs, catalog entities, inventory, purchasing, customers, promotions, sales, payments, returns, cash events, calendar, devices.
  - Configure database adapters: SQLite for local dev, Postgres (Supabase) for staging/prod; create migration and seeding pipeline (demo tenant, about 120 products with variants/modifiers, suppliers, promos, loyalty accounts, batches/expiry, sample reservations).
  - Implement environment configuration loader, rate limiting (per prompt), and Supabase integration (database plus storage for media, Auth if leveraged).
  - Set up observability: structured logs with request/incident IDs, metrics (Prometheus/OpenTelemetry), distributed tracing, Sentry integration, health checks.

- **Authentication & Security**
  - Implement email/password auth, short-lived JWT plus refresh tokens, shared cookie domain, POS device registration, POS PIN verification, TOTP-based 2FA for managers/owners, password policy enforcement.
  - Build RBAC middleware reading tenant-specific permission switchboard; support thresholds (discount percent, void time) and enforce across endpoints.
  - Log all mutations to AuditLog with user, tenant, device, IP; add optional backoffice IP allowlist enforcement.

- **Domain APIs & Services**
  - `/auth`: login, refresh, logout, POS device pairing, 2FA setup/verification, password reset, session listing.
  - `/catalog`: CRUD with bulk import/export, price lists, schedules, station routing, asset upload signatures.
  - `/inventory`: stock levels, FEFO allocation, movements, batches/expiry, adjustments, transfers, counts, wastage.
  - `/purchasing`: suppliers, POs, approvals, GRNs (partial/full), supplier invoices, cost history calculations.
  - `/crm`: customers, loyalty rules, balance adjustments, store credit, gift card issuance/redemption.
  - `/promotions`: rule definitions, constraint enforcement, redemption tracking, evaluation endpoints for POS.
  - `/sales`: orders (idempotent via Idempotency-Key), payments (idempotent), returns/exchanges, ticket hold/resume storage, charges (tips/service/minimum), cash drawer events.
  - `/kds`: ticket feed, bump/recall, station assignments.
  - `/reports`: summary endpoints (sales, inventory valuation, purchasing KPIs, loyalty, taxes, tips), export job management (CSV/XLSX/PDF generation via worker queue).
  - `/calendar`: reservations, tasks, stock counts, PO arrivals with notifications.
  - `/devices`: register pairing, printer/scanner configs, diagnostics, firmware updates.
  - `/admin/backoffice`: tenant settings (branding, tokens, paper shader controls), roles/permissions switchboard, notifications config, audit log search.

- **Offline & Sync Infrastructure**
  - Provide catalog version endpoint (`catalog_vX`) with diff support, signed hash, and TTL; expose change feed for incremental updates.
  - Implement order queue sync worker: on reconnect, POST `/sales/orders` plus `/sales/payments` with idempotency, handle conflicts, send status updates to POS.
  - Expose sync status API and WebSocket events for queue progress and failures.
  - Add WebSocket gateways for POS (order updates), KDS (ticket stream), inventory alerts; ensure tenant scoping and auth tokens.

- **Integrations & Adapters**
  - Create abstraction interfaces for payments, receipts, hardware (printers, cash drawers, scanners); supply mock/local adapters, enabling future provider swaps.
  - Integrate Supabase storage helpers for product images and menus; ensure signed URLs or public bucket policy per spec.
  - Prepare email service adapter (Supabase, Resend, etc.) for receipts and notifications.

- **Backend QA, DevOps & Docs**
  - Write Jest unit and integration tests (Prisma test environment, API contract tests, WebSocket tests); include acceptance scenarios (offline sync, FEFO, PO to GRN, promo stackability, calendar to POS, accounting reconciliation).
  - Configure CI (GitHub Actions or Turborepo pipeline) for lint/type/test/migrate; add deployment workflows for Fly.io/Render/Vercel Functions; manage environment promotion.
  - Set up monitoring dashboards (Grafana/DataDog equivalent), alerting rules, backup strategy, runbooks for incidents, rate limit breaches, sync failures.
  - Document backend architecture, API contracts (OpenAPI/AsyncAPI), deployment instructions, operational checklists.

---

## Cross-Cutting Deliverables & Acceptance Gates
- Demo data and fixture scripts to support UI demos and automated tests.
- Accessibility and i18n audits across representative screens (light/dark, RTL) with remediation tasks.
- Performance validation: POS cold load <= 2s, search < 100ms, add-to-cart render <= 150ms under 1k products, paper shader <= 2ms/frame or auto-disable.
- Offline QA: disconnect scenario (cash sale plus receipt), reconnect sync without duplicates, status pills accurate.
- Compliance checklist: RBAC enforcement, audit log coverage, encryption at rest, incident ID surfacing.
- Documentation bundle: quick start, hardware setup, imports guide, permission matrix, end-of-day operations, paper shader controls, offline troubleshooting.

---

## Execution Order & Coordination
- Kick off with monorepo restructuring and design token pipeline (enables parallel frontend/back-end work).
- Backend and Sync team delivers auth foundations and catalog APIs early so POS rebuild can integrate real data and offline cache.
- Domain apps proceed once shared UI kit and API contracts stabilise; enforce integration checkpoints for offline sync, KDS WebSockets, reports exports.
- Quality/Ops thread runs continuously: testing harness, CI/CD, observability, documentation, accessibility/performance audits ahead of MVP sign-off.

## 2024-11-24 UI Foundation Kickoff
- Added CSS variable token sheet for light/dark themes and motion/radius primitives (`src/styles/tokens.css`).
- Updated Tailwind configuration to source colors/radii/shadows from token variables via opacity helper (`tailwind.config.js`).
- Expanded global styles to load Inter, apply base resets, focus states, and expose tabular-numeric utility (`src/index.css`).
- Encountered `npm run build` exiting with code 1 without logs; re-ran with `tee` to capture output and confirmed build succeeds (logged in `build.log`).

## 2024-11-24 Theme Controller & Shared UI
- Implemented Zustand-powered theme store with system-preference sync, tenant overrides, and persisted paper shader settings (`src/stores/themeStore.ts`).
- Added `ThemeProvider` to manage `data-theme` on the root element and react to tenant changes + media queries (`src/providers/ThemeProvider.tsx`, wired via `src/main.tsx`).
- Updated `PaperShader` and `AppShell` to consume the centralized theme state and introduced a header toggle for light/dark/auto cycling (`src/components/ui/PaperShader.tsx`, `src/components/layout/AppShell.tsx`, `src/components/ui/ThemeModeToggle.tsx`).
- Created initial `@mas/ui` package with token-aware `Button`, `Card`, and `Surface` primitives and refactored portal tiles/summary panels to use them (`src/packages/ui/*`, `src/components/apps/Portal.tsx`).
- Established path aliases for shared packages/utilities in both TypeScript and Vite config (`tsconfig.app.json`, `vite.config.ts`) and added utility helpers (`src/utils/*`).
- Encountered Windows-specific `npm install` cleanup errors (EPERM/EBUSY) leaving partial `node_modules`; resolved by manually removing the directory and reinstalling targeted packages, then confirmed toolchain with `npx vite --version`. Noted that `npm run build` exits with code 1 unless output is piped—captured logs via `tee` to ensure build succeeds (`build.log`).

### 2024-11-24 Build Alias Fix
- Resolved Vite import error for `@mas/ui` by pointing the alias directly at the package entry file (`vite.config.ts`).
- Verified fix with `npm run build` (captured via `tee`) to ensure bundler recognises new shared UI module.

### 2024-11-24 Theme Loop Fix
- Addressed `Maximum update depth exceeded` caused by tenant theme reapplication triggering infinite Zustand updates. Added change detection in `applyTenantSettings` so mode/paper shader state only updates when values differ, and applied shallow selector to `useTheme` to avoid needless rerenders (`src/stores/themeStore.ts`).
- Verified with `npm run build` (piped to `tee`) to ensure bundler succeeds after theme store changes.

### 2024-11-24 Theme Stability Hardening
- Prevented tenant settings effect from repeatedly reapplying theme overrides by tracking last applied payload in `ThemeProvider` (`src/providers/ThemeProvider.tsx`).
- When tenant settings match current state, the theme store now returns an empty patch instead of the existing state to avoid triggering additional store updates (`src/stores/themeStore.ts`).
- Verified with `npm run build` (captured via `tee`) after the adjustments.

## 2024-11-24 Backoffice Theme Controls
- Replaced backoffice placeholder with settings experience offering theme mode selection, paper shader toggles, intensity/speed sliders, surface targeting, and live preview cards (`src/components/apps/BackOffice.tsx`, wired via `src/App.tsx`).
- Extended `ThemeProvider` to expose paper shader state via `data-theme`/`data-paper-cards` attributes and CSS variables; cards now pick up grain overlays when enabled (`src/providers/ThemeProvider.tsx`, `src/styles/tokens.css`, `src/index.css`).
- Updated shared `Card` primitive to opt into the paper texture and reused it across the portal grid and preview panels (`src/packages/ui/card.tsx`, `src/components/apps/Portal.tsx`).
- Verified build with `npm run build` (captured through `tee`) after the new controls and styling pipeline.
