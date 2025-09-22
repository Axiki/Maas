# MAS Frontend Implementation Guide

## Architecture & Boot Flow
- Stack: React 18 + TypeScript via Vite (`src/main.tsx`), Tailwind tokens layered with custom CSS (`src/styles/tokens.css`, `src/index.css`).
- Providers: `ThemeProvider` manages dark/auto modes and paper shader hydration (`src/providers/ThemeProvider.tsx`); `UXProvider` centralises modals, toasts, and confirmation dialogs (`src/providers/UXProvider.tsx`); `LoadingProvider` supplies global loading overlays (`src/providers/LoadingProvider.tsx`).
- State: Zustand stores back authentication (`src/stores/authStore.ts`), cart logic (`src/stores/cartStore.ts`), offline queue/cache (`src/stores/offlineStore.ts`), and theming (`src/stores/themeStore.ts`). Mock tenant/user/store data live in `src/data/mockData.ts`.
- Motion system: Framer Motion is wrapped in `MotionWrapper` for route/page transitions; GSAP drives staggered reveals inside key views (Portal, POS).

## Shell, Navigation & Layout
- Routing (`src/App.tsx`): After login, all routes mount inside `AppShell`. Nested routes: `/portal`, `/pos`, `/kds`, `/products`, `/inventory`, `/inventory/transfer`, `/products/create`, `/purchasing`, `/customers`, `/promotions`, `/reports`, `/calendar`, `/accounting`, `/imports`, `/devices`, `/backoffice`, `/ux-demo`, `/support` plus `/promotions` (builder) and `/ux-demo` sandbox.
- `AppShell` (`src/components/layout/AppShell.tsx`):
  - Left nav rail with role-filtered apps from `appConfigs` (`src/config/apps.ts`). Active state, hover motion, and quick launch button return to `/portal`.
  - Header: breadcrumbs, status indicator, command palette launcher (Ctrl/Cmd+K), notifications panel (Ctrl/Cmd+N) with unread badges, tenant switcher (Ctrl/Cmd+T) seeded with sample tenants, theme toggle, and user avatar.
  - Command palette lists apps and quick actions with keyboard navigation; selection navigates via React Router.
  - Responsive mobile nav drawer replicates app grid; header collapses to hamburger on <lg breakpoints.
  - Footer (`src/components/layout/Footer.tsx`) includes SLA stats, contact CTAs, regulatory links, environment readout, and scroll-to-top control.
  - Paper shader overlay toggled based on theme store preferences.

## Authentication Flow
- `/login` (`src/components/auth/Login.tsx`): simple credential form with animated entrance; accepts demo credentials (`manager@bellavista.com` / `password`). Successful login seeds auth store with mock tenant/store and routes to `/portal`.

## Feature Modules & Routes
- **Portal `/portal` (`src/components/apps/Portal.tsx`)**: Hero CTA, analytics pills, rotating usage metrics carousel, quick action cards, app grid with role filtering, alert list, recent activity, and GSAP staggered reveals. Buttons deep-link into core modules.
- **Point of Sale `/pos` (`src/components/apps/POS.tsx`)**:
  - Product grid with category tabs, search, promotion badges, and GSAP animations using mock data.
  - Cart sidebar (persistent on desktop, drawer on mobile) with quantity controls, order type toggle (dine-in/takeaway), subtotal/tax/total computation via `useCartStore`.
  - Checkout queues an offline order in `useOfflineStore`, priming IndexedDB (localforage) for future sync; currently logs success and clears cart.
  - Responsive breakpoints toggle cart visibility; mobile action button opens drawer.
- **Kitchen Display `/kds` (`src/components/apps/KDS.tsx`)**: Mock stations with ticket counts, animated ticket cards showing status pill, elapsed timers, and action buttons (Mark Ready/Bump).
- **Products `/products` (`src/components/apps/Products.tsx`)**: Category summary card, product table (with mobile-friendly cards), quick link to creation flow.
  - **Create Product `/products/create` (`src/components/apps/CreateProduct.tsx`)**: Multi-step product builder with variants, scheduling toggles, imagery, recipe/ingredient management, station tags, preview summary. Uses shared form inputs (`src/packages/ui`). Toast on submission and nav back to catalog.
  - **Ingredient Selector (`src/components/apps/IngredientSelector.tsx`)** surfaces modal for BOM selection used inside the form.
- **Inventory `/inventory` (`src/components/apps/Inventory.tsx`)**: Stock KPIs, pending movements card, low-stock alerts, quick links to create transfers/counts.
  - **Create Transfer `/inventory/transfer` (`src/components/apps/CreateTransfer.tsx`)**: Workflow capturing source/destination stores, dates, priority, required approvals, and line items with quantity controls; confirmation toast then redirect to inventory.
- **Purchasing `/purchasing` (`src/components/apps/Purchasing.tsx`)**: Purchase order list, outstanding invoices, recent GRNs with table + mobile cards.
- **Customers `/customers` (`src/components/apps/Customers.tsx`)**: Segment KPIs, loyalty leaderboard table, campaign actions.
- **Promotions `/promotions` (`src/components/apps/promotions/PromotionsBuilder.tsx`)**: Comprehensive promotions builder covering campaign list filter, rule editor, eligibility toggles, scheduling, order type pills, preview badges (using `src/data/promotions.ts`).
- **Reports `/reports` (`src/components/apps/Reports.tsx`)**: KPI cards, placeholder charts using skeletons, top-items table. Export + period controls.
- **Calendar `/calendar` (`src/components/apps/Calendar.tsx`)**: Week view placeholder, upcoming events list, task board.
- **Accounting `/accounting` (`src/components/apps/Accounting.tsx`)**: Ledger cards, journal entries table, export actions.
- **Imports `/imports` (`src/components/apps/Imports.tsx`)**: Dry-run form wired to toast feedback, template catalog, recent import log with status chips, skeleton placeholders for upcoming jobs.
- **Devices `/devices` (`src/components/apps/Devices.tsx`)**: Registers/printers lists, run diagnostics confirm dialog via `useDialog`, toast feedback, pairing CTA.
- **BackOffice `/backoffice` (`src/components/apps/BackOffice.tsx`)**: Theme mode controls, paper shader tuner (intensity/speed/surfaces), upcoming tasks list, live preview tiles pulling from theme store.
- **UX Demo `/ux-demo` (`src/components/ui/UXDemo.tsx`)**: Showcase of loading spinners, skeleton components (`SkeletonCard`, `SkeletonTable`, `SkeletonGrid`), toast variants, global loading overlay, and empty states.
- **Support `/support` (`src/components/apps/Support.tsx`)**: Searchable knowledge hub, quick actions triggering toasts, category cards, recent articles list.

## Shared UI & Design System
- `@mas/ui` package (`src/packages/ui`) exposes Button, Input, Select, Checkbox, Radio, Pill Action, Split Button, Bulk Action Bar, etc., providing consistent tokens, radius, and states.
- `StatusIndicator` (`src/components/ui/StatusIndicator.tsx`) renders connectivity/perf badges for the header.
- `PaperShader` (`src/components/ui/PaperShader.tsx`) layers WebGL/SVG noise with configurable intensity and surfaces.
- Skeleton family in `src/components/ui` plus `LoadingOverlay` and `EmptyState` cover load/empty feedback.
- Motion helpers (`MotionWrapper`, `AnimatedList`) centralise page transitions and list animations.

## Data & Mocking Strategy
- All domain data comes from local constants (`src/data/mockData.ts`, `src/data/promotions.ts`); no API integration yet.
- Offline store queues and cached collections use localforage but actual network sync functions are stubs (`useOfflineStore.syncQueuedOrders`).
- App configs (`src/config/apps.ts`) define per-role availability; optional metadata (e.g., `shortcut`) ready for future enhancements.

## Known Gaps vs Prompt Spec
1. **Backend Integration**: No real API, WebSocket, or database connectivity; all flows depend on mock data. POS offline sync, promotion validation, and imports are conceptual.
2. **Advanced POS Flows**: Manager approvals, modifiers UI, split tenders, receipts, table map, barcode scanning, and offline printing are not implemented beyond placeholders/logs.
3. **KDS & Real-Time Updates**: Ticket lifecycle is static; no WebSocket-driven updates or device pairing.
4. **Inventory/Purchasing Logic**: Cycle counts, FEFO, supplier invoices, cost updates, and CSV imports are UI-only with no calculations or persis
