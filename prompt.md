MAS — MVP Suite Spec (Restaurants & Retail)

SaaS • Online-first with Offline Buffer • Separate Apps via Launcher • POS ≠ Backoffice
Motion: GSAP and Framer Motion • Paper Shader aesthetic option

Builder-ready spec for Unlovable. This version adds a tasteful paper shader (subtle grain/fiber texture with light-reactive shading) and formalizes Framer Motion alongside GSAP. POS runs as an installable PWA; Backoffice is a separate app. All screens use your tokens + Inter.

0) Suite Overview
0.1 Apps (tiles & routes)

/portal — Suite Launcher (Odoo-style grid; role-aware, favorites, badges).

/pos — POS PWA (waiters, cashiers, bartenders, supervisors/managers).

/kds — Kitchen Display (lite).

/products — Catalog manager.

/inventory — Stock, batches/expiry, movements, counts.

/purchasing — Suppliers, POs, GRNs, cost updates.

/customers — CRM, loyalty, store credit, gift cards.

/promotions — Rules engine.

/reports — Sales/Inventory/Purchasing/Loyalty.

/calendar — Reservations, stock counts, PO arrivals, tasks.

/accounting — Basic daybook, tax payable, COGS snapshot, mini P&L, exports.

/imports — Guided CSV imports (dry-run validator).

/devices — Registers, printers, cash drawer, scanners (diagnostics).

/backoffice — Settings, roles/permissions, taxes/charges, theming, tenant admin.

Visibility is role-filtered by /suite/apps. Clicking a tile opens its own shell; an app switcher returns to /portal.

0.2 Non-functional baselines

Perf: POS cold load ≤2s; search <100ms; add-to-cart render ≤150ms.

Uptime: Online-first with offline buffer (POS only).

Security: RBAC, 2FA for managers/owners, audit logs, PII encrypted at rest.

Accessibility: WCAG AA; keyboard operable; visible focus.

i18n/RTL: Plumbing ready; locale bundles.

Observability: Logs, metrics, traces; incident IDs surfaced to users.

1) Visual System, Motion, and Paper Shader
1.1 Tokens (light & dark) + Typography
--bg-dust:#ECEBE8; --surface-100:#F5F5F4; --surface-200:#E8E7E4;
--primary-700:#B21E1E; --primary-600:#D12E2E; --primary-500:#E44343; --primary-100:#FCE8E8;
--ink:#0A0A0A; --ink-70:rgba(10,10,10,.70); --line:#D9D7D3; --muted:#9A9994;
--success:#148A3B; --warning:#C48A0A; --danger:#B21E1E;


Typeface: Inter (use tabular-nums for prices).

Radii/Depth: 12–16px; two elevation levels (card/list).

Components: modern nav rail, pill buttons, sticky tabs, cards, zebra tables, debounced global search.

Dark mode: in MVP (auto + toggle).

1.2 Motion Stack

Framer Motion for component-level interactions (cards, modals, lists, route mounts/unmounts).

GSAP for orchestrated sequences (staggered grids, scroll-triggered reveals, timeline chaining).

Patterns (defaults):

Route transitions: Framer <AnimatePresence> cross-fade 180–240ms.

Item grid: GSAP stagger 30ms, slide-up 12px + fade.

Press feedback: scale 1.02 + soft shadow 160–180ms (haptics if supported).

Scroll areas: smooth inertia; sticky category underline with progress tween.

Loading: splash, skeletons, glass overlays with progress.

1.3 Paper Shader (subtle tactile aesthetic)

Goal: add gentle “paper grain & fiber” to backgrounds/surfaces for warmth without hurting legibility.

Implementation:

A WebGL canvas (Three.js or raw WebGL) renders a fragment shader combining:

Blue-noise grain (time-animated at low amplitude),

Sparse fiber streaks,

Soft vignette tied to elevation (cards get slightly brighter “ink” pressure).

Composited beneath UI via a fixed, non-interactive layer; respects prefers-reduced-motion.

Fallbacks: static SVG noise tiling (data-URI) → then a flat color if WebGL disabled.

Controls (Backoffice → Appearance): toggle Paper Shader On/Off, intensity (0–1), grain animation speed, per-surface application (bg only vs bg+cards).

Performance budget: shader pass ≤ 2ms/frame on mid-range tablets @60fps; auto-disables on low GPU or battery saver.

Accessibility: never reduce contrast below WCAG AA; grain intensity clamps when contrast would drop.

Acceptance: enable/disable live without reload; no measurable jank in POS item scroll; contrast audits pass in both themes.

2) Tech & Architecture

Monorepo: apps/{portal,pos,backoffice,kds,products,inventory,purchasing,customers,promotions,reports,calendar,accounting,imports,devices,server} + packages/{ui,shared}.

Frontend: React + TypeScript; Tailwind + tokens; Framer Motion & GSAP; POS/KDS as PWAs.

POS Offline Buffer: IndexedDB cache (catalog/prices/taxes/promos + 72h orders) and queued orders with idempotency keys; allow cash sales & printing offline; auto-sync on reconnect; prevent duplicate captures.

Backend: Node (NestJS/Express) + Prisma/TypeORM; SQLite by default (dev/demo) with Postgres via .env; REST + WebSocket.

Multi-tenant SaaS: tenant_id scoping; per-tenant branding; rate-limits.

Auth/SSO: shared cookie domain; POS PIN; email+password for backoffice; 2FA for managers/owners; short-lived JWT + refresh.

Security: RBAC checks on all mutations, audit trail, PII encrypted at rest, password policy, optional backoffice IP allowlist.

Observability: logs, metrics, traces; incident IDs surfaced to UI.

3) POS — /pos (PWA, offline buffer)
3.1 Layout & modes

Left: Cart (swipe/kebab: Discount/Note/Remove), totals (subtotal, tax, charges: tips/service/minimum), customer attach.

Right: Sticky category tabs + animated item grid (image, name, price, badges).

Top: Search (name/SKU/barcode), Hold/Resume, New sale, Status pill (Online/Syncing/Offline X), Manager key.

Bottom: Payments (Cash, Card, Wallet), Discount/Coupon, Park, Proceed.

Modes: Waiter (tables, courses, seat items), Bartender (tabs, repeat round), Cashier (barcode-first).

3.2 Core flows

Add/modify: tap/scan; long-press qty keypad; modifiers (required/optional), combos/bundles; per-line notes.

Discounts: line/cart %/amount with reason codes; thresholds by role.

Customers: quick create (name/phone), loyalty points, store credit.

Charges: tips, service charge, minimum order charge as explicit lines.

Tickets: Hold/Resume (nameable); survive refresh/offline.

Returns/Exchanges: by receipt/order or customer; partial; reason coded; stock adjust.

3.3 Payments & receipts

Methods: Cash, Card (external terminal now), Wallet/Mobile (manual), Split payments.

Idempotency: Idempotency-Key on order create & payment attach.

Receipts: Print (ESC/POS LAN), Email, QR. Gift receipt option (no prices).

3.4 Restaurant specifics

Order types: Dine-in / Takeaway / Delivery.

Table map (basic): sections, table status, merge/split checks, per-seat items, course notes (“Fire Appetizers”).

KDS routing: station tags on products; send on “Fire”.

3.5 Retail specifics

Barcode scanning: continuous HID; price check.

Variants: size/color/style; barcode per variant; images per variant.

Manual weight entry: priced-by-weight (kg/lb) with tare.

3.6 Offline buffer (POS only)

Cache: IndexedDB stores catalog/prices/taxes/promos + last 72h orders.

Queue: orders/returns and cash payments persist offline; on reconnect auto-sync with conflict checks.

Rules: block new card captures while offline; receipts still print; status pill shows Queued X.

3.7 Acceptance (POS)

Add item → line appears ≤150ms; Framer Motion item pop + GSAP micro-burst ok.

Switch categories → GSAP stagger 30ms + slide/fade; smooth at 200+ items.

Discount beyond threshold → Manager PIN modal; audit entry written.

Offline: disconnect, complete cash sale, print; reconnect → single synced order (no dupes).

Hold/resume 5+ tickets; persistent post-refresh.

Paper shader on/off does not affect readability or FPS.

4) KDS — /kds (lite)

Station feed (New/In-Progress/Done), bump/recall, order aging timers, sound cue on new.

Filters: by station, rush only.

Fallback: if KDS unreachable, POS kitchen-prints via ESC/POS.

Acceptance: sending items from POS creates tickets at station; bump updates live.

5) Products — /products

Entities: Category (nestable), Product, Variant/SKU, Barcode(s), Unit of Measure.

Pricing: base, tax incl/excl, cost, min/max price, price lists (by store/customer group).

Modifiers & Combos: groups (required/optional), price deltas, bundle pricing.

Assets: images, station tags, printer routing.

Time schedules: availability by day/time (e.g., Lunch, Happy Hour).

Acceptance: product+variant with barcode appears in POS and routes to correct station; schedule hides item outside window.

6) Inventory — /inventory

Stock on hand per store; reservations from open tickets.

Movements: sale, return, receipt, transfer, adjustment, wastage/spoilage (reason).

Batches/Lots & Expiry: capture on GRN; FEFO suggestion on sale; block expired (toggle).

Counts: cycle counts; import CSV; variance report with approvals.

Acceptance: partial transfer adjusts both stores; FEFO prompts earliest batch; expired block works when enabled.

7) Purchasing — /purchasing

Suppliers: contacts, terms, lead times.

PO lifecycle: Create → Approve → Email/PDF; expected date; item costs.

GRN: receive full/partial; capture batch/expiry; cost updates with history.

Supplier invoice (record): link to PO/GRN for margin accuracy.

Acceptance: receiving updates stock & average cost; partial receive keeps PO open; PDF PO exports.

8) Customers — /customers

Profiles: name, phone/email, tags, notes, store credit balance.

Loyalty: points earn/burn rules; expiration window; show in POS.

Gift cards: issue, redeem, balance, void; barcode supported.

Acceptance: earn on sale, redeem next sale; expiry respected; gift card barcode works at POS.

9) Promotions — /promotions

Rules: item/category % or amount, Buy X Get Y, bundle price.

Constraints: date/time, store(s), customer group, redemption cap.

Stackability: stack vs exclusive; priority ordering.

Acceptance: rule fires only within constraints; stack/exclusive behavior passes matrix tests.

10) Reports — /reports

Dashboard: today vs yesterday, WTD; top items/categories; avg basket; voids/discounts; payment mix; tips.

Sales: by hour/day/store/cashier/item/category; tax; charges (tips/service/min).

Inventory: stock on hand, valuation (FIFO & Average), aging, shrinkage, wastage.

Purchasing: PO status, supplier fill rate, cost changes.

Loyalty/Promos: points issued/redeemed; promo performance.

Exports: CSV/XLSX/PDF (server-side).

Acceptance: filters (date/store/cashier) apply uniformly; export matches on-screen totals.

11) Calendar — /calendar

Event types: Reservations (restaurant), Stock counts, PO ETA, Tasks/Reminders.

Views: Month/Week/Day; drag-to-create; assign staff; reminders (in-app/email).

Reservation details: party size, table/section, contact phone, notes, status (Booked/Seated/No-show).

Linkage: reservation → table status in POS waiter mode.

Acceptance: reservation blocks slot; check-in marks table occupied in POS.

12) Accounting (Basic) — /accounting

Daybook: summarized journal of sales/returns/payments/tips/charges/taxes per day & register.

Tax payable: collected vs remitted; by rate.

COGS snapshot: sales × cost (avg/FIFO) by period; gross margin.

Mini P&L: Sales – COGS = Gross margin; basic OPEX (manual import).

Cash management: float, pay-ins/pay-outs, cash rounding rules; drawer reconciliation (Z-report feed).

Exports: CSV/XLSX; mapping stubs for Xero/QuickBooks.

Acceptance: Z-report totals tie to Daybook; tax report reconciles; COGS uses selected valuation.

13) Imports — /imports

Templates: items/variants/barcodes, customers, suppliers, stock counts, price lists.

Flow: upload → dry-run validator → error CSV (row, column, message) → confirm commit.

Column mapping UI; saved mappings per tenant.

Acceptance: invalid rows rejected with actionable errors; commit shows created/updated counts.

14) Devices — /devices

Registers: pair name → store & printer set; lock to store; version banner; update prompt.

Printers: add LAN ESC/POS; test print; set kitchen vs receipt roles; cash-drawer kick test.

Scanners: HID test field; wedge config tips.

Diagnostics: connectivity, time drift, app version; SW update banner.

Acceptance: printer test prints; drawer kicks; POS picks correct kitchen/receipt target.

15) Backoffice — /backoffice

Settings: currency, formats, time zone, logo, email templates, theme tokens, Paper Shader controls.

Taxes & Charges: rates/zones; inclusive/exclusive; tips, service, minimum charge.

Roles/Permissions (switchboard): checkbox per rule; thresholds (e.g., “Discount ≤10/≤30%”, “Void after payment (X min)”, “Return w/o receipt”, “Open drawer (no sale)”, “Price override”).

Users: invite, 2FA enforcement, device/session list, reset PINs.

Tenant Admin (SaaS): plan, seats, usage, backups, rate limits, data export/delete requests.

Notifications: low stock, nearing expiry, PO due, sync failures, approval requests.

Acceptance: threshold edits immediately enforce at POS; audit logs show who changed what.

16) Data Model (condensed)

Org: Company, Store, Register

Auth: User, Role, Permission, Session, Approval

Catalog: Category, Product, Variant, SKU, Barcode, ModifierGroup, Modifier, PriceList, Schedule

CRM: Customer, LoyaltyAccount, GiftCard, StoreCredit

Inventory: BatchLot(code, expiry), StockLevel(store, sku, qty), StockMovement(type, reason)

Purchasing: Supplier, PurchaseOrder, PurchaseOrderLine, GoodsReceipt, SupplierInvoice

Promos: Promotion, PromotionRule, PromotionRedemption

Sales: Order(type, status, totals, taxes, charges, customer_id, offline_guid), OrderLine(sku_id, qty, price, discount, tax, modifiers_json, batch_allocation), Payment(order_id, method, amount, reference, idempotency_key), Return/Exchange

Ops: ZReport, CashDrawerEvent(pay-in/out), AuditLog

Calendar: Event(type, start/end, meta), Reservation(table, party_size, status)

17) API (examples) & Sockets

REST: /auth/*, /catalog/*, /inventory/*, /purchasing/*, /crm/*, /promotions/*, /sales/*, /reports/*, /calendar/*, /devices/*, /admin/*

Use Idempotency-Key on /sales/orders & /sales/payments.

WebSockets: sales (order updates), kds (ticket flow), inventory (alerts).

18) Permissions (defaults)

Cashier/Waiter/Bartender: sell, hold/resume, returns with receipt, discounts ≤10%, open drawer with sale, read-only reports.

Supervisor: discounts ≤30%, price override, post-payment void (≤10 min), open drawer (no sale), return w/o receipt (≤7 days).

Store Manager: create products, stock adjustments, promotions, EOD finalize, device pairing.

Inventory Manager: GRN, transfers, counts, wastage.

Accountant: reports, accounting exports, taxes config (not prices).

Owner/Admin: roles, thresholds, tenant settings, data export.

Restricted actions prompt Manager PIN and write AuditLog.

19) Testing & Acceptance (MVP exit)

Perf: POS metrics met under 1k products; shader pass ≤2ms/frame or auto-disabled.

Offline: queue → sync parity; no duplicate payments; status pill accurate.

Receipts: standard & gift; kitchen/receipt printers selectable; drawer kick test OK.

Inventory: FEFO & block expired toggles verified; counts import adjusts stock.

Purchasing: PO→GRN partial receive updates costs & stock.

Promos: exclusive vs stackable pass matrix (≥6 scenarios).

Calendar: reservation → POS table status.

Accounting: Daybook = Z-report; tax payable reconciles; COGS matches valuation.

Permissions: switchboard changes live; audit entries written.

Accessibility & i18n: AA contrast; keyboard flows; two pages validated in RTL.

Observability: incident IDs shown; logs correlate via request id.

20) Delivery Checklist

All apps above, each in its own shell (no embedded layouts).

Server with SQLite default; Postgres via .env.

Seed tenant, store, roles, ~120 demo products (variants/modifiers), suppliers, promos, loyalty, batches/expiry.

CSV importers + validator with error CSV.

Test set (unit + Cypress E2E): POS sale, offline→online sync, GRN w/ batch+expiry, promo stack/exclusive, reservation→POS.

CI & docs (quick start, hardware setup, imports, permission switchboard, EOD ops, paper shader controls).