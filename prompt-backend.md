MAS — MVP (Restaurants & Retail)

SaaS • Online-first with Offline Buffer • Separate Apps • /backoffice

0) Goal & Positioning

Ship a production-ready MVP for restaurants and retail shops that feels like Lightspeed/Odoo but simpler to run. MAS is online-first (fast to ship) with a small offline buffer so short internet drops don’t stop sales. The suite is split into separate apps launched from a portal—no embedded UIs.

1) Apps (separate shells)

/portal – App launcher (Odoo-style tiles, role-aware).

/pos – Staff POS PWA (waiters, cashiers, bartenders, supervisors/managers).

/backoffice – Manager web (catalog, inventory, purchasing, promos, customers, reports, permissions).

/kds – Kitchen Display (lite).

/calendar – Shared calendar (reservations, stock counts, PO arrivals, tasks).

MVP constraint: 1 register per location (designed to scale later).

2) Visual & Motion System

Typeface: Inter (tabular numerals for prices).

Design tokens (light & dark):

--bg-dust:#ECEBE8; --surface-100:#F5F5F4; --surface-200:#E8E7E4;
--primary-700:#B21E1E; --primary-600:#D12E2E; --primary-500:#E44343; --primary-100:#FCE8E8;
--ink:#0A0A0A; --ink-70:rgba(10,10,10,.70); --line:#D9D7D3; --muted:#9A9994;
--success:#148A3B; --warning:#C48A0A; --danger:#B21E1E;


Components: modern nav rail, pill buttons (12–16px radius), cards with soft depth, sticky tabs, debounced global search.

GSAP micro-interactions: tile grid stagger (30ms), item-card slide/fade, press scale (1.02), smooth scroll, route cross-fade (180–240ms).

Loading polish: splash + skeletons + glass overlays.

Accessibility: WCAG AA, keyboard support, focus rings.

i18n/RTL-ready plumbing.

3) Tech & Architecture

Monorepo: apps/{portal,pos,backoffice,kds,calendar,server} + packages/{ui,shared}.

Frontend: React + TypeScript (Vite or Next), Zustand/Redux, Tailwind + tokens, GSAP/Framer Motion.

POS Offline Buffer: IndexedDB cache (catalog/prices/taxes/promos + 72h orders) and queued orders with idempotency keys; allow cash sales & printing offline; auto-sync on reconnect; prevent duplicate captures.

Backend: Node (NestJS/Express) + Prisma/TypeORM; SQLite by default (dev/demo) with Postgres via .env; REST + WebSocket.

Multi-tenant SaaS: tenant_id scoping; per-tenant branding; rate-limits.

Auth/SSO: shared cookie domain; POS PIN; email+password for backoffice; 2FA for managers/owners; short-lived JWT + refresh.

Security: RBAC checks on all mutations, audit trail, PII encrypted at rest, password policy, optional backoffice IP allowlist.

Observability: logs, metrics, traces; incident IDs in UI.

4) Roles (defaults; all editable in Admin)

Cashier/Waiter/Bartender, Supervisor, Store Manager, Inventory Manager, Accountant, Owner/Admin.

Permission switchboard: checkbox next to each rule (e.g., “Discount ≤10/30%”, “Price override”, “Void after payment (X min)”, “Open drawer (no sale)”, “Return w/o receipt”). Manager approval prompts for restricted actions.

5) POS (/pos) — MVP Flows

Layout: Left = Cart; Right = sticky category tabs + animated item grid; Top = search, hold/resume, status, manager key; Bottom = payment bar.

Add/Modify: tap/scan; long-press qty; modifiers (required/optional), combos.

Discounts: line or cart (%/amount) with reason codes; gates by role.

Charges: tips, service charge, minimum order charge (configurable & reportable).

Customers: quick create; attach; show loyalty points/store credit.

Tickets: hold/resume multiple, named; survive reload/offline.

**Returns/Ex

You said:
I meant in apps, what did we miss? what do people need?businesses? analyze before writing
ChatGPT said:
Thought for 37s

Great question. If you want an Odoo-style suite of apps (tiles), here’s what businesses in restaurants + retail typically expect. I grouped them by priority so you can decide what goes in MVP vs later.

What apps did we miss? (Analysis + Recommendation)
Tier 1 — Must-have tiles for MVP

POS — Selling, returns, tips/charges, receipts, split payments, offline buffer.

KDS — Per-station ticket view; bump/recall; order aging.

Products (Catalog) — Items, variants, barcodes, modifiers/combos, price lists, images, routing.

Inventory — Stock on hand, movements, transfers, cycle counts (CSV), batches/lots + expiry (FEFO).

Purchasing — Suppliers → PO → GRN (partial/full) → cost updates → supplier invoice record.

Customers & Loyalty — Profiles, store credit, points earn/burn with expiry, gift cards.

Promotions — %/amount, Buy X Get Y, bundle price, time/store constraints; stackable toggle.

Reports & Analytics — Sales (hour/day/store/cashier/item), inventory valuation (FIFO & Avg), tips/discounts, purchasing KPIs; CSV/XLSX/PDF.

Calendar — Reservations/waitlist (restaurant), stock counts, PO arrival dates, tasks & reminders.

Settings & Permissions (Backoffice) — Roles matrix with checkbox toggles + thresholds; tax/charges; printer/payment adapters; tenant theming.

Accounting (Basic) — Daybook (sales/returns/tips/charges), tax payable, cash movement, COGS snapshot, P&L mini, bank/export (CSV/XLSX). (Export-first; full GL later.)

Imports — Guided CSV importer (items/variants/barcodes, customers, suppliers, stock counts, price lists) with dry-run validator.

Device Manager — Register pairing, receipt/kitchen printers, cash drawer test, barcode scanner test, diagnostics.

Tier 2 — Strong next steps (close the “table-stakes” gap)

Staff & Timeclock — Clock-in/out, breaks, tip pooling, basic schedule; export to payroll.

Reservations & Floor (if you want it separate from Calendar) — Table map, sections, turn-time, SMS reminders.

Label & Barcode Printing — Shelf labels, price stickers, item labels (templates).

Notifications Center — Low stock/expiry alerts, PO due, sync failures, approval requests (in-app + email).

Billing & Subscription (SaaS Admin) — Tenant plan, seats, invoices, payment method, usage.

Integrations Hub — Connectors (accounting, e-commerce, delivery) with toggleable adapters.

Audit & Compliance — Advanced logs, data exports/deletion requests, IP allowlist for Backoffice.

Menu Engineering / Recipe Costing+ — Ingredient cost roll-up, margin heatmaps, menu mix; waste tracking.

Tier 3 — Growth / Optional

Online Ordering & QR Menu — Dine-in QR, pickup/delivery, self-checkout.

Delivery & Driver — Order batching, route/driver assignment, handoff logs.

Warehouse (for larger retailers) — Multi-site transfers, putaway, pick/pack/ship.

Supplier Portal — Vendors confirm POs, ASN, delivery windows.

Customer Portal — Receipts, loyalty balance, gift card management.

Recommended MVP tile set (what I’d ship first)

POS, KDS, Products, Inventory, Purchasing, Customers & Loyalty, Promotions, Reports, Calendar, Settings & Permissions, Accounting (Basic), Imports, Device Manager.
Everything else = Phase 2+.

If you’re good with this lineup, I’ll fold it into a compact MVP brief (with URLs like /pos, /kds, /products, /inventory, /purchasing, /customers, /promotions, /reports, /calendar, /backoffice (settings), /accounting, /imports, /devices) and keep the launcher grid role-aware so users only see what they’re allowed to open.

You said:
write it way more detailed 
ChatGPT said:
MAS — Full MVP Suite Spec (Restaurants & Retail)

SaaS • Online-first with Offline Buffer • Separate Apps via Launcher • POS ≠ Backoffice

This is a builder-ready spec for Unlovable. It defines apps (tiles), UX, APIs, data, permissions, and acceptance. POS runs as its own PWA; Backoffice is separate. All screens use your tokens & Inter typeface; GSAP drives motion.

0) Suite Overview
0.1 Apps (tiles & routes)

/portal — Suite Launcher (Odoo-style grid; role-aware).

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

Visibility is role-filtered by the launcher service (/suite/apps). Clicking a tile opens its own shell; an app switcher returns to /portal.

0.2 Non-functional baselines

Perf: POS cold load ≤2s; search <100ms; add-to-cart render ≤150ms.

Uptime: Online-first with offline buffer (POS only).

Security: RBAC, 2FA for managers/owners, audit logs, PII at rest encrypted.

Accessibility: WCAG AA; keyboard operable; visible focus.

i18n/RTL: Plumbing ready; copy via locale bundles.

Observability: Logs, metrics, traces; incident IDs surfaced to users.

0.3 Design & Motion (apply everywhere)

Tokens (you supplied): surfaces, primary reds, ink, success/warn/danger.

Inter typography with tabular numerals for prices.

Components: nav rail, pill buttons (12–16px), sticky tabs, cards, zebra tables.

GSAP: grid stagger (30ms), slide-up 12px + fade, press scale 1.02, route cross-fade 180–240ms.

Loading: splash, skeletons, glass overlays.

1) POS — /pos (PWA, offline buffer)
1.1 Layout & modes

Left: Cart lines (swipe or kebab: Discount/Note/Remove), totals (subtotal, tax, charges: tips/service/minimum, grand total), customer attach.

Right: Sticky category tabs + animated item grid (image, name, price, badges).

Top bar: Search (name/SKU/barcode, fuzzy), Hold/Resume, New sale, Status pill (Online/Syncing/Offline X), Manager key.

Bottom bar: Payments (Cash, Card, Wallet), Discount/Coupon, Park, Proceed.

Modes: Waiter (tables, courses, seat items), Bartender (tabs, repeat round), Cashier (barcode-first).

1.2 Core flows

Add & edit lines: tap/scan; long-press for qty keypad; modifiers (required/optional), combos/bundles; per-line notes.

Discounts: line/cart % or amount; reason codes; thresholds via role.

Customers: quick create (name/phone), loyalty points, store credit.

Charges: Tips, Service charge, Minimum order charge (config). Visible as lines.

Tickets: Hold/Resume (nameable); survive refresh/offline.

Returns/Exchanges: by receipt/order or customer; partial; reason coded; stock adjust.

1.3 Payments & receipts

Methods: Cash, Card (external terminal now), Wallet/Mobile (manual), Split payments.

Idempotency: Idempotency-Key on order create & payment attach.

Receipts: Print (ESC/POS LAN), Email, QR. Gift receipt option (no prices).

1.4 Restaurant specifics

Order types: Dine-in / Takeaway / Delivery.

Table map (basic): sections, table status, merge/split checks, per-seat items, course notes (“Fire Appetizers”).

KDS routing: station tags on products; send on “Fire”.

1.5 Retail specifics

Barcode scanning: continuous HID; price check.

Variants: size/color/style; barcode per variant; images per variant.

Manual weight entry: priced-by-weight items (kg/lb) with tare.

1.6 Offline buffer (POS only)

Cache: IndexedDB stores catalog/prices/taxes/promos + last 72h orders.

Queue: orders/returns (and cash payments) persist offline; on reconnect auto-sync with conflict checks.

Rules: Block new card captures while offline; receipts still print; status pill shows Queued X.

1.7 Acceptance (POS)

Add item → line appears ≤150ms; mini burst animation.

Switch categories → cards stagger 30ms with slide/fade; perf steady on 200+ items.

Discount beyond threshold → Manager PIN modal; audit entry written.

Offline test: disconnect, complete cash sale, print receipt; reconnect → single synced order (no dupes).

Hold/resume 5+ tickets; persistent post-refresh.

2) KDS — /kds (lite)

Station feed (New/In-Progress/Done), bump/recall, order aging timers, sound cue on new.

Filters: by station, rush only.

Fallback: if KDS unreachable, POS can kitchen-print tickets via ESC/POS.

Acceptance: sending items from POS creates tickets at station, bumping updates status live.

3) Products — /products

Entities: Category (nestable), Product, Variant/SKU, Barcode(s), Unit of Measure.

Pricing: base, tax incl/excl, cost, min/max price, price lists (by store/customer group).

Modifiers & Combos: groups (required/optional), price deltas, bundle pricing.

Assets: images, station tags, printer routing.

Time schedules: availability by day/time (e.g., Lunch, Happy Hour).

Acceptance: create product+variant with barcode; appears in POS search & correct station routes; schedule hides item outside window.

4) Inventory — /inventory

Stock on hand per store; reservations from open tickets.

Movements: sale, return, receipt, transfer, adjustment, wastage/spoilage (reason coded).

Batches/Lots & Expiry: capture on GRN; FEFO suggestion on sale; block expired (toggle).

Counts: cycle counts; import CSV; variance report with approvals.

Acceptance: partial transfer adjusts both stores; FEFO prompts earliest batch; expired block works when enabled.

5) Purchasing — /purchasing

Suppliers: contacts, terms, lead times.

PO lifecycle: Create → Approve → Email/PDF; expected date; item costs.

GRN: receive full/partial; capture batch/expiry; cost updates with history.

Supplier invoice (record): link to PO/GRN for margin accuracy.

Acceptance: receiving updates stock & average cost; partial receive keeps PO open; PDF PO exports.

6) Customers — /customers

Profiles: name, phone/email, tags, notes, store credit balance.

Loyalty: points earn/burn rules; expiration window; show in POS.

Gift cards: issue, redeem, balance, void; barcode supported.

Acceptance: earn on sale, redeem next sale; expiry respected; gift card barcode works at POS.

7) Promotions — /promotions

Rules: item/category % or amount, Buy X Get Y, bundle price.

Constraints: date/time, store(s), customer group, redemption cap.

Stackability: stack vs exclusive toggle; priority ordering.

Acceptance: rule fires only within constraints; stack/exclusive behavior verified with matrix tests.

8) Reports — /reports

Dashboard: today vs yesterday, WTD; top items/categories; avg basket; voids/discounts; payment mix; tips.

Sales: by hour/day/store/cashier/item/category; tax, charges (tips/service/min).

Inventory: stock on hand, valuation (FIFO & Average), aging, shrinkage, wastage.

Purchasing: PO status, supplier fill rate, cost changes.

Loyalty/Promos: points issued/redeemed; promo performance.

Exports: CSV/XLSX/PDF (server-side generation).

Acceptance: filters (date/store/cashier) apply consistently; export matches on-screen totals.

9) Calendar — /calendar

Event types: Reservations (restaurant), Stock counts, PO ETA, Tasks/Reminders.

Views: Month/Week/Day; drag-to-create; invite staff (internal).

Reservation details: party size, table/section, contact phone, notes, status (Booked/Seated/No-show).

Notifications: email/in-app reminders for PO due, count assignments.

Acceptance: reservation creates blocked slot; check-in marks table occupied in POS waiter mode.

10) Accounting (Basic) — /accounting

Export-first accounting to satisfy owners/accountants without full GL.

Daybook: summarized journal of sales/returns/payments/tips/charges/taxes per day & register.

Tax payable: collected vs remitted; by rate.

COGS snapshot: sales × cost (avg/FIFO) by period; gross margin report.

Mini P&L: Sales – COGS = Gross margin; basic operating expenses (manual entry/import).

Cash management: float, pay-ins/pay-outs, cash rounding rules; drawer reconciliation (/pos EOD pushes here).

Exports: CSV/XLSX; mapping ready for Xero/QuickBooks import.

Acceptance: Z-report totals equal Daybook; tax report ties to sales; COGS uses chosen valuation.

11) Imports — /imports

Templates: items/variants/barcodes, customers, suppliers, stock counts, price lists.

Flow: upload → dry-run validator → error CSV (row, column, message) → confirm to commit.

Column mapping UI; saved mappings per tenant.

Acceptance: invalid rows rejected with actionable errors; commit shows how many records updated/created.

12) Devices — /devices

Registers: pair name → store & printer set; lock to store.

Printers: add LAN ESC/POS; test print; set kitchen vs receipt roles; cash-drawer kick test.

Scanners: HID test field (beeps OK); wedge config tips.

Diagnostics: connectivity, time drift, app version; SW update banner.

Acceptance: printer test prints; drawer kicks; POS picks correct kitchen/receipt target.

13) Backoffice — /backoffice

Settings: currency, number formats, time zone, logo, email templates, theme tokens.

Taxes & Charges: define rates/zones; inclusive/exclusive; tips, service, minimum charge.

Roles/Permissions (switchboard): checkbox next to each rule; thresholds (e.g., “Discount ≤10%/≤30%”, “Void after payment (X min)”, “Return w/o receipt”, “Open drawer (no sale)”, “Price override”).

Users: invite, 2FA enforcement, device/session list, reset PINs.

Tenant Admin (SaaS): plan, seat count, usage, backups, rate limits, data export/delete requests.

Notifications center: low stock, nearing expiry, PO due, sync failures, approval requests.

Acceptance: changing a threshold instantly affects POS behavior; audit logs show who changed what.

14) Data Model (condensed ERD)

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

15) API Surface (examples)

POST /auth/login, POST /auth/refresh, POST /auth/mfa/verify

GET/POST /catalog/products|variants|modifiers|pricelists

GET/POST /inventory/stock-levels|movements|counts|batches

GET/POST /purchasing/suppliers|pos|grns|invoices

GET/POST /crm/customers|loyalty|giftcards

GET/POST /promos/rules

POST /sales/orders (Idempotency-Key required), POST /sales/payments, POST /sales/returns

GET /reports/* (server-side aggregation; export endpoints return files)

GET/POST /calendar/events|reservations

GET/POST /devices/printers|registers|tests

GET/POST /admin/settings|roles|permissions|thresholds

WebSockets: sales (order updates), kds (ticket flow), inventory (low stock alerts).

16) Permissions Matrix (defaults)

Cashier/Waiter/Bartender: sell, hold/resume, returns with receipt, discounts ≤10%, open drawer with sale, read-only reports.

Supervisor: discounts ≤30%, price override, post-payment void (≤10 min), open drawer (no sale), return w/o receipt (≤7 days).

Store Manager: create products, stock adjustments, promotions, EOD finalize, device pairing.

Inventory Manager: GRN, transfers, counts, wastage.

Accountant: reports, accounting exports, taxes config (not prices).

Owner/Admin: roles, thresholds, tenant settings, data export.

All prompts for restricted actions require Manager PIN, produce audit entries.

17) Hardware (MVP)

Tablets/PC: iPad (Safari) or Android/Windows (Chrome/Edge).

Printers: Epson TM-m30II / TM-T20II (LAN).

Cash drawers: RJ11/12 via printer.

Scanners: Zebra/Honeywell (HID).

Network: Ethernet for printers; reliable Wi-Fi for tablets.

18) Imports & Migration (free paths)

CSV templates; dry-run validator; error CSV with line/column; saved column mappings.

Supported: products+variants+barcodes, customers, suppliers, counts, price lists.

19) Testing & Acceptance (MVP exit criteria)

Perf: POS metrics meet targets under 1k product catalog.

Offline: queue → sync parity; no duplicate payments; status pill accurate.

Receipts: standard & gift; printer test works from /devices.

Inventory: FEFO & block expired toggles verified; counts import adjusts stock.

Purchasing: PO→GRN partial receive updates costs & stock.

Promos: exclusive vs stackable pass matrix (at least 6 scenarios).

Calendar: reservation blocks slot and reflects at POS table map.

Accounting: Daybook matches Z-report totals; tax payable ties to sales tax lines; COGS matches valuation mode.

Permissions: threshold edits in /backoffice immediately enforce at POS; all restricted actions audited.

Accessibility: Keyboard passthrough on POS & Backoffice; contrast checks pass.

i18n: strings externalized; RTL flip validated on two pages.

Observability: error shows incident ID; server logs correlate via request id.

20) Delivery Checklist

Apps: /portal, /pos, /kds, /products, /inventory, /purchasing, /customers, /promotions, /reports, /calendar, /accounting, /imports, /devices, /backoffice.

Server: REST + WS; SQLite default; Postgres via .env.

Seed: tenant, store, roles, 120 demo products (with variants, modifiers), suppliers, promos, loyalty, batches/expiry.

Docs: Quick start, hardware setup, imports guide, permission switchboard, EOD ops.

Tests: unit + a few Cypress E2E (POS sale, offline→online sync, GRN w/ batch+expiry, promo stack/exclusive, reservation → POS).

CI: build, lint, test; artefacts; environment vars template.

Build Notes (must-follow)

Treat design tokens + motion timings as acceptance criteria.

Keep POS PWA isolated; only POS gets offline buffer.

Use Idempotency-Key on order/payment creates, and surface conflicts to the UI.

Every mutation checks RBAC; privileged actions must raise approval modals and write AuditLog.

Keep APIs stateless & multi-tenant; avoid tight coupling so future processors/printers plug in cleanly.

This is the comprehensive MVP your builders can execute now; you can configure DB, gateways, and branding post-delivery.

You said:
rewrtie and add paper shader and framer motion as well
ChatGPT said:
Thought for 6s
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

Build Notes (must-follow)

Treat design tokens, motion timings, and paper shader budgets as acceptance criteria.

Only POS gets the offline buffer.

Keep APIs stateless & multi-tenant; adapters for printers/payments are pluggable.

Use Framer Motion for mounts/unmounts and micro-interactions; GSAP for staggered lists, scroll-trigger sequences, and complex timelines.

Paper shader must be tasteful and optional (toggle), never harming readability or performance.

You said:
okay write a full prompt for the wbsite front end back end api routes pages db
recommend an easy to build db with ai, maybe supabase or if smthg is easier and lastign 

let the prompt be veryyyyyy detailed and super clear
ChatGPT said:
Thought for 7s
MAS — Ultra-Detailed Build Prompt (Frontend + Backend + API + DB)

Goal: Build a production-ready SaaS for restaurants & retail with a separate app per module (Odoo-style launcher), online-first + a small offline buffer (POS only), gorgeous UI (Framer Motion + GSAP, optional paper shader), and a simple, durable cloud database.

0) Tech Decisions (simple, lasting, easy to ship)

DB + Auth + Storage (recommended): Supabase (PostgreSQL)

Why: hosted Postgres (durable, portable), row-level security (RLS), built-in Auth (email/OTP/SSO), file storage (product images), REST/Realtime out of the box. Great docs.

Alt (dev-only): SQLite for quick demos. Keep schema compatible with Postgres migration.

ORM: Prisma (works great with Postgres; easy migrations and type-safe queries).

Backend: Node.js 20 + NestJS (or Express if team prefers) exposing REST + WebSocket.

Frontend: React + TypeScript. POS/KDS are PWAs. Styling with Tailwind + CSS variables (design tokens).

Animations: Framer Motion (component transitions) + GSAP (staggered grids, scroll timelines).

Monorepo: Turbo/PNPM.

Offline buffer (POS only): IndexedDB via Dexie (catalog cache + queued orders).

Printing: ESC/POS over LAN (Epson TM-m30II/T20II) + cash drawer kick.

Payments: Mock/manual in MVP; adapters to add real processors later.

1) Design System (tokens, motion, paper shader)

Typeface: Inter (use tabular numerals for prices).

Color tokens (light/dark)

--bg-dust:#ECEBE8; --surface-100:#F5F5F4; --surface-200:#E8E7E4;
--primary-700:#B21E1E; --primary-600:#D12E2E; --primary-500:#E44343; --primary-100:#FCE8E8;
--ink:#0A0A0A; --ink-70:rgba(10,10,10,.70); --line:#D9D7D3; --muted:#9A9994;
--success:#148A3B; --warning:#C48A0A; --danger:#B21E1E;


Components: vertical nav rail with icons, pill buttons (12–16px radius), sticky tabs, cards with soft depth (two elevation levels), zebra tables, debounced global search, toasts.

Motion defaults:

Route transitions: Framer <AnimatePresence> cross-fade 180–240ms.

Item grids: GSAP stagger 30ms, slide-up 12px + fade.

Press feedback: scale 1.02 for 160–180ms; slight shadow.

Smooth scroll; sticky underline progress on category tabs.

Paper Shader (optional aesthetic):

WebGL layer (Three.js or raw) with subtle blue-noise grain + fiber streaks; animated gently; auto-disables on low GPU or prefers-reduced-motion.

Backoffice toggle: On/Off, intensity (0–1), apply to bg only vs bg+cards. Must preserve WCAG AA contrast and stay ≤2ms/frame on mid tablets.

2) App Suite & Routes (separate shells)

/portal — Launcher grid (role-aware, favorites, badges: Installed/Coming Soon/Restricted).

/pos — POS PWA (waiters/cashiers/bartenders/managers).

/kds — Kitchen Display (lite).

/products — Catalog manager.

/inventory — Stock/batches/expiry/movements/counts.

/purchasing — Suppliers, POs, GRNs, cost updates.

/customers — CRM, loyalty, store credit, gift cards.

/promotions — Rules engine.

/reports — Sales/Inventory/Purchasing/Loyalty exports.

/calendar — Reservations, stock counts, PO ETA, tasks.

/accounting — Basic daybook, tax payable, COGS snapshot, mini P&L, exports.

/imports — Guided CSV import with dry-run validator.

/devices — Registers, printers, cash drawer, scanners (diagnostics).

/backoffice — Settings, roles/permissions switchboard, taxes/charges, theming.

POS/KDS are installable PWAs. No module is “embedded” inside another. App switcher returns to /portal.

3) Monorepo Layout
mas/
  apps/
    portal/        # launcher
    pos/           # PWA
    kds/           # PWA (lite)
    products/
    inventory/
    purchasing/
    customers/
    promotions/
    reports/
    calendar/
    accounting/
    imports/
    devices/
    backoffice/
    server/        # NestJS (REST+WS)
  packages/
    ui/            # tokens, buttons, tiles, modals, tables
    shared/        # zod schemas, types, api clients, constants
  prisma/          # Prisma schema & migrations
  supabase/        # SQL policies/seeds (if using RLS)


Root scripts (package.json)

{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev -n init",
    "seed": "node apps/server/scripts/seed.mjs"
  }
}

4) Database (Supabase/Postgres) — schema (Prisma)

Use this as a single source of truth. Keep tables multi-tenant via tenantId everywhere.

datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model Tenant {
  id           String  @id @default(cuid())
  slug         String  @unique
  name         String
  createdAt    DateTime @default(now())
  Stores       Store[]
  Users        UserTenant[]
}

model Store {
  id         String  @id @default(cuid())
  tenantId   String
  name       String
  timezone   String
  createdAt  DateTime @default(now())
  tenant     Tenant   @relation(fields:[tenantId], references:[id])
  Registers  Register[]
  StockLevels StockLevel[]
  Orders     Order[]
}

model Register {
  id         String  @id @default(cuid())
  tenantId   String
  storeId    String
  name       String
  pairedAt   DateTime?
  registerKey String   @unique
  tenant     Tenant   @relation(fields:[tenantId], references:[id])
  store      Store    @relation(fields:[storeId], references:[id])
}

model User {
  id          String  @id @default(cuid())
  email       String  @unique
  passwordHash String?
  twoFASecret String?
  createdAt   DateTime @default(now())
  // Supabase auth can manage primary auth; sync userId <-> supabase uid
  Tenants     UserTenant[]
}

model UserTenant {
  id        String  @id @default(cuid())
  tenantId  String
  userId    String
  role      Role
  createdAt DateTime @default(now())
  tenant    Tenant @relation(fields:[tenantId], references:[id])
  user      User   @relation(fields:[userId], references:[id])
}

enum Role {
  CASHIER
  WAITER
  BARTENDER
  SUPERVISOR
  STORE_MANAGER
  INVENTORY_MANAGER
  ACCOUNTANT
  OWNER
  ADMIN
}

model Category {
  id        String @id @default(cuid())
  tenantId  String
  parentId  String?
  name      String
  sortOrder Int     @default(0)
  tenant    Tenant @relation(fields:[tenantId], references:[id])
}

model Product {
  id        String @id @default(cuid())
  tenantId  String
  name      String
  description String?
  categoryId String?
  basePrice Decimal @db.Decimal(12,2)
  taxIncl   Boolean @default(false)
  cost      Decimal @db.Decimal(12,2) @default(0)
  active    Boolean @default(true)
  imageUrl  String?
  stationTag String? // kitchen routing
  tenant    Tenant @relation(fields:[tenantId], references:[id])
  Variants  Variant[]
}

model Variant {
  id         String @id @default(cuid())
  tenantId   String
  productId  String
  name       String  // e.g., Size/Color
  sku        String  @unique
  barcode    String?
  price      Decimal @db.Decimal(12,2)
  cost       Decimal @db.Decimal(12,2) @default(0)
  imageUrl   String?
  tenant     Tenant  @relation(fields:[tenantId], references:[id])
  product    Product @relation(fields:[productId], references:[id])
}

model ModifierGroup {
  id        String @id @default(cuid())
  tenantId  String
  name      String
  required  Boolean @default(false)
  maxSelect Int?
  tenant    Tenant @relation(fields:[tenantId], references:[id])
  Modifiers Modifier[]
}

model Modifier {
  id         String @id @default(cuid())
  tenantId   String
  groupId    String
  name       String
  priceDelta Decimal @db.Decimal(12,2) @default(0)
  tenant     Tenant @relation(fields:[tenantId], references:[id])
  group      ModifierGroup @relation(fields:[groupId], references:[id])
}

model BatchLot {
  id        String @id @default(cuid())
  tenantId  String
  variantId String
  code      String
  expiry    DateTime?
  tenant    Tenant  @relation(fields:[tenantId], references:[id])
  variant   Variant @relation(fields:[variantId], references:[id])
}

model StockLevel {
  id        String @id @default(cuid())
  tenantId  String
  storeId   String
  variantId String
  qty       Int     @default(0)
  updatedAt DateTime @default(now())
  tenant    Tenant  @relation(fields:[tenantId], references:[id])
  store     Store   @relation(fields:[storeId], references:[id])
  variant   Variant @relation(fields:[variantId], references:[id])
}

enum MovementType { SALE RETURN RECEIPT TRANSFER ADJUSTMENT WASTAGE }

model StockMovement {
  id         String @id @default(cuid())
  tenantId   String
  storeId    String
  variantId  String
  type       MovementType
  qty        Int
  reason     String?
  batchLotId String?
  createdAt  DateTime @default(now())
}

model Customer {
  id         String @id @default(cuid())
  tenantId   String
  name       String
  phone      String?
  email      String?
  notes      String?
  points     Int     @default(0)
  storeCredit Decimal @db.Decimal(12,2) @default(0)
  createdAt  DateTime @default(now())
}

model GiftCard {
  id         String @id @default(cuid())
  tenantId   String
  number     String  @unique
  balance    Decimal @db.Decimal(12,2) @default(0)
  active     Boolean @default(true)
}

model Promotion {
  id        String @id @default(cuid())
  tenantId  String
  name      String
  startsAt  DateTime?
  endsAt    DateTime?
  stackable Boolean @default(false)
  ruleJson  Json     // Buy X Get Y / percent / amount / bundle
  active    Boolean  @default(true)
}

model Order {
  id          String  @id @default(cuid())
  tenantId    String
  storeId     String
  registerId  String
  type        String   // dine-in/takeaway/delivery/retail
  status      String   // Open/Completed/Void/Returned
  customerId  String?
  subtotal    Decimal  @db.Decimal(12,2)
  taxTotal    Decimal  @db.Decimal(12,2)
  chargesJson Json     // tips/service/minimum
  discountTotal Decimal @db.Decimal(12,2) @default(0)
  total       Decimal  @db.Decimal(12,2)
  offlineGuid String?  @unique
  createdAt   DateTime @default(now())
}

model OrderLine {
  id         String @id @default(cuid())
  tenantId   String
  orderId    String
  variantId  String
  qty        Int
  price      Decimal @db.Decimal(12,2)
  discount   Decimal @db.Decimal(12,2) @default(0)
  tax        Decimal @db.Decimal(12,2) @default(0)
  modifiers  Json?
  batchAllocation Json?
}

model Payment {
  id         String @id @default(cuid())
  tenantId   String
  orderId    String
  method     String   // Cash/Card/Wallet
  amount     Decimal  @db.Decimal(12,2)
  reference  String?
  idempotencyKey String @unique
  createdAt  DateTime @default(now())
}

model Return {
  id         String @id @default(cuid())
  tenantId   String
  orderId    String     // original order
  reason     String?
  createdAt  DateTime @default(now())
}

model ZReport {
  id        String @id @default(cuid())
  tenantId  String
  storeId   String
  registerId String
  date      DateTime
  data      Json // totals, cash counts, discrepancies
}

model AuditLog {
  id        String @id @default(cuid())
  tenantId  String
  userId    String?
  action    String
  entity    String?
  entityId  String?
  meta      Json?
  createdAt DateTime @default(now())
}

model CalendarEvent {
  id        String @id @default(cuid())
  tenantId  String
  type      String // reservation/stock_count/po_eta/task
  title     String
  start     DateTime
  end       DateTime
  meta      Json?
}

model Reservation {
  id        String @id @default(cuid())
  tenantId  String
  storeId   String
  table     String
  partySize Int
  status    String // Booked/Seated/No-show
  contact   String?
  start     DateTime
  end       DateTime
  notes     String?
}


Supabase setup

Create project → set DATABASE_URL in .env.

Enable Auth (email/OTP). Sync Supabase auth.users.id with our User.id on signup (trigger).

Create storage buckets: product-images, receipts.

RLS policies: allow access where tenantId matches user’s tenant membership; read/write restricted by role (use Postgres function current_user_tenant() resolved from JWT claims).

Add Row Level Security on all tenant tables with policies, e.g.:

create policy tenant_select on "Product"
for select using (tenant_id() = tenantId);

create policy tenant_modify on "Product"
for insert with check (tenant_id() = tenantId)
for update using (tenant_id() = tenantId);


(Implement tenant_id() via a Postgres function reading JWT claim tenant_id.)

5) Backend API (NestJS) — routes & contracts

Base path: /api/v1. All mutations require RBAC checks + audit logging. Use Idempotency-Key header for order and payment creation.

Auth & Tenancy

POST /auth/login (email/password) → {accessToken, refreshToken}

POST /auth/refresh

POST /auth/mfa/verify (TOTP)

GET /me → {user, roles[], tenant, stores[]}

POST /switch-tenant (owner/admin only)

Catalog

GET /catalog/categories

POST /catalog/categories

GET /catalog/products?active=true&search=...

POST /catalog/products

GET /catalog/variants?productId=...

POST /catalog/variants

POST /catalog/modifier-groups

POST /catalog/modifiers

Inventory

GET /inventory/stock-levels?storeId=...&variantId=...

POST /inventory/movements {type, qty, reason, batchLotId}

POST /inventory/counts/import (CSV)

GET /inventory/batches?variantId=...

Purchasing

GET /purchasing/suppliers / POST /purchasing/suppliers

POST /purchasing/pos (create PO)

POST /purchasing/grns (receive; batch/expiry capture; partial ok)

POST /purchasing/invoices

CRM / Loyalty / Gift Cards

GET /crm/customers / POST /crm/customers

POST /crm/loyalty/earn / POST /crm/loyalty/redeem

POST /crm/giftcards/issue / POST /crm/giftcards/redeem

Promotions

GET /promotions / POST /promotions (ruleJson schema: percent/amount/bundle/BXGY; constraints; stackable flag)

POST /promotions/price-check (POS uses it if needed; usually cached)

Sales (POS)

POST /sales/orders (requires Idempotency-Key)
Body: {storeId, registerId, type, customerId?, lines:[{variantId, qty, price, discount, tax, modifiers?, batchAllocation?}], charges:{tips,service,minimum}, subtotal, taxTotal, discountTotal, total, offlineGuid?}
Resp: {orderId, status:"Completed"|"Open"}

POST /sales/payments (Idempotency-Key) → {paymentId}

POST /sales/returns → create Return, movements adjust stock

GET /sales/orders/:id

WS channel sales: broadcast order status updates.

Reports (server-side aggregation)

GET /reports/dashboard?from=...&to=...

GET /reports/sales?groupBy=day|hour|store|cashier|item

GET /reports/inventory/valuation?method=fifo|avg

GET /reports/purchasing/kpis

GET /reports/loyalty

GET /reports/export.csv|.xlsx|.pdf

Calendar

GET /calendar/events?type=reservation|stock_count|po_eta|task

POST /calendar/events

POST /calendar/reservations/check-in (links to table occupancy in POS)

Devices

GET /devices/registers / POST /devices/registers/pair

POST /devices/printers (LAN host/port/model)

POST /devices/printers/test

POST /devices/drawer/kick

Admin / Backoffice

GET /admin/settings / POST /admin/settings (currency, formats, theme tokens, paper shader toggles)

GET /admin/taxes / POST /admin/taxes

GET /admin/charges / POST /admin/charges (tips/service/minimum)

Permissions switchboard

GET /admin/permissions → list of rules w/ thresholds

POST /admin/permissions → toggle rule, update threshold

GET /admin/audit (filter by actor, action, date)

Errors: JSON with code, message, optional incidentId. Always log to AuditLog for privileged actions.

6) Frontend Pages (by app)
/portal

Tile grid (role-aware), search, favorites. GSAP tile entrance (stagger 30ms), press scale 1.02. Badges for Restricted/Coming Soon. Paper shader visible in background (toggle).

/pos (PWA)

Home: Left cart (swipe/kebab actions), Right sticky tabs + animated grid.

Search: global fuzzy (name/SKU/barcode).

Customer attach: modal (quick create).

Discount/Charges: per line/cart with reason codes; tips/service/minimum lines visible.

Payments: Cash/Card/Wallet, split; receipt print/email/QR; gift receipt.

Hold/Resume: list with labels, persistent across refresh.

Returns/Exchanges: receipt scan or search; reason codes.

Waiter: table map (sections), seat items, courses, “Fire to KDS”; split/merge checks.

Bartender: open tabs, repeat last round, alcohol permission check.

Status pill: Online/Syncing/Offline(X queued); offline banner when needed.

PWA install prompt, ESC/POS printer selector, test print.

/kds

Ticket feed by station; New/In-Progress/Done; bump/recall; order aging; sound cues. Kitchen-print fallback from POS.

/products

Category tree; product list; create/edit product with variants, SKUs/barcodes, images (Supabase storage), station tags, schedules (availability windows), modifiers/combos.

/inventory

Stock on hand; stock movements; batches/lots + expiry; FEFO suggestions; cycle counts (CSV import/export), variance approval.

/purchasing

Suppliers; PO create/approve/email (PDF); expected date; GRN full/partial receive with batch/expiry capture; cost updates; link supplier invoices.

/customers

CRM list & profile; points, store credit; gift cards issue/redeem; tags/notes.

/promotions

Rule builder: percent/amount/bundle/BXGY; constraints (date/time, store(s), customer group, caps); stackable toggle; priority.

/reports

Dashboard KPIs; drilldowns; export CSV/XLSX/PDF. Charts with recharts (or similar).

/calendar

Month/Week/Day; create reservations (party size, table, phone), stock counts, PO ETAs, tasks; reminders (email/in-app). Check-in updates POS table state.

/accounting

Daybook, tax payable, COGS snapshot (avg/FIFO), mini P&L (manual OPEX import), cash management (float, pay-ins/pay-outs, rounding rules). Exports.

/imports

Upload → dry-run → error CSV (row/column/message) → commit. Saved column mappings.

/devices

Pair register to store; add printers (LAN host/port/model), test print; drawer kick; scanner test (HID input); diagnostics (version, time drift, network).

/backoffice

Settings: currency, formats, time zone, logo, email templates, theme tokens & paper shader controls.

Taxes & charges (tips/service/minimum).

Permissions switchboard: checkbox per rule; thresholds (e.g., “Discount ≤10%/≤30%”, “Void after payment (X min)”, “Return w/o receipt”, “Open drawer (no sale)”, “Price override”).

Users: invite, roles per tenant, enforce 2FA, device/session list.

Tenant admin: plan, seats, usage, backups, rate limits, data export/delete.

7) POS Offline Buffer — IndexedDB shapes

Stores:

catalog_vX: {variants[], products[], categories[], prices, taxes, promos} (versioned; refresh hourly)

orders_queue: {offlineGuid, orderBody, payments[], createdAt, idempotencyKey}

recent_orders: last 72h orders for lookup/returns
Behavior:

When offline: allow cash sales, print receipts, enqueue order + payment.

On reconnect: POST /sales/orders (with idempotency key) then /sales/payments, reconcile totals, mark synced.

Never attempt a new card capture offline.

8) Permissions & Security

Roles: CASHIER/WAITER/BARTENDER, SUPERVISOR, STORE_MANAGER, INVENTORY_MANAGER, ACCOUNTANT, OWNER/ADMIN.

Switchboard toggles with thresholds (numbers/time) editable per tenant.

Restricted actions trigger Manager PIN modal and write AuditLog.

Backoffice supports 2FA (TOTP). Optionally enforce IP allowlist for backoffice.

9) Example API Contracts (JSON)

Create Order POST /api/v1/sales/orders

{
  "storeId":"st_1",
  "registerId":"rg_1",
  "type":"dine-in",
  "customerId":null,
  "lines":[
    {"variantId":"v_123","qty":2,"price":"12.00","discount":"0.00","tax":"1.80","modifiers":[{"id":"m_no_onion","priceDelta":"0.00"}]}
  ],
  "charges":{"tips":"2.00","service":"0.00","minimum":"0.00"},
  "subtotal":"24.00","taxTotal":"3.60","discountTotal":"0.00","total":"29.60",
  "offlineGuid":"c2b6-...-cafe"
}


Headers: Idempotency-Key: 6e287...

Create Payment POST /api/v1/sales/payments

{
  "orderId":"ord_1",
  "method":"Cash",
  "amount":"29.60",
  "reference":"till1-0921",
  "idempotencyKey":"pay-6e287..."
}


Promotion rule JSON (examples)

{ "type":"PERCENT", "value":10, "scope":"CATEGORY", "categoryId":"cat_burgers",
  "constraints":{"start":"2025-09-01","end":"2025-09-30","days":[1,2,3,4,5],"stores":["st_1"],"stackable":false}}

{ "type":"BXGY", "buy":{"variantId":"v_1","qty":2}, "get":{"variantId":"v_1","qty":1,"price":"0.00"} }

10) Env Vars (.env) — server
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/mas
JWT_SECRET=change-me
REFRESH_SECRET=change-me-too
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
COOKIE_DOMAIN=.mas.app
RATE_LIMIT_PER_MIN=300

11) Deployment Plan

Supabase: create project, set DB password, enable Auth, create storage buckets, run schema (Prisma migrate), add RLS functions/policies.

Server: deploy on Fly.io/Render/Vercel Functions (Nest API on Node runtime). Attach Supabase URL & Service Key.

Frontends: build and deploy each app to Vercel/Netlify; share .mas.app cookie domain for SSO.

DNS: {tenant}.mas.app subdomain routing.

CI: Turbo build, Prisma migrate, run tests, produce artifacts.

Observability: set up Logflare/Supabase Logs + Sentry (front & back).

12) Acceptance Criteria (sign-off list)

POS cold load ≤2s; search <100ms; cart update ≤150ms.

Offline sale (cash) prints receipt; order & payment sync once on reconnect; no duplicate records.

FEFO suggests earliest batch; expired items blocked when toggle is on.

PO → partial GRN updates stock & average cost; open balance remains.

Promotions: stack vs exclusive verified with test matrix.

Calendar reservation → POS table marked occupied.

Daybook totals = Z-report; tax payable reconciles; COGS matches chosen valuation (avg/FIFO).

Permissions switchboard updates take effect immediately at POS; audit entries written.

Paper shader toggle works without FPS or contrast regressions.

Exports: Sales/Inventory/Accounting CSV/XLSX/PDF match on-screen totals.

Accessibility AA: visible focus, keyboard flows; i18n plumbing + basic RTL check.

13) Builder Notes (must-follow)

Treat design tokens, motion timings, and paper shader budget as acceptance criteria.

Keep apps isolated (no embedded layouts). Use the launcher UX to navigate.

Only POS has offline cache/queue.

All writes: check RBAC + write AuditLog.

Use Idempotency-Key for /sales/orders and /sales/payments.

Supabase RLS or server-side checks must enforce tenantId scoping for every query.

Store product images in Supabase Storage; serve with signed URLs or public bucket as appropriate.

Keep payment/printing behind adapters so real providers can be dropped in later.