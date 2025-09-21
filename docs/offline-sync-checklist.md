# Offline Sale → Reconnect Checklist

This manual checklist exercises the offline buffer, catalog cache, and reconciliation flow.
Run the steps in order in a development build (`npm run dev`). Use the Offline Debug panel to
inspect metadata while progressing.

## 1. Warm the offline catalog cache

- [ ] Log in and open the POS app.
- [ ] Confirm the Status indicator shows `Online` and the Offline Debug panel (DEV badge) lists
      populated counts for products, categories, pricing, and tax rules.
- [ ] Reload the page and ensure the cached catalog instantly repopulates (no flicker). The
      debug panel should show the same counts with an updated "Catalog" timestamp.

## 2. Queue an order while offline

- [ ] In the browser devtools, toggle the network to **Offline** (or run `navigator.onLine` check).
- [ ] Add at least two items to the POS cart and process payment.
- [ ] Expect the Status indicator to switch to `Offline • X queued` and the debug panel queue to
      list the new order with queued timestamp and offline GUID.

## 3. Reconnect and reconcile

- [ ] Restore connectivity in devtools (turn network back to **Online**).
- [ ] Observe the Status indicator transition to `Syncing` and then `Online`.
- [ ] Verify the queued order disappears from the debug panel and a success log entry is recorded
      (message `Order <id> synced successfully`).
- [ ] Confirm `Last sync` timestamps refresh in both the Status indicator and debug panel.

## 4. Conflict handling regression

- [ ] With connectivity online, queue the same order twice (use the debug panel to copy the
      offline GUID, then manually enqueue via console: `useOfflineStore.getState().queueOrder(order)`).
- [ ] Force an offline → online cycle. Expect the second copy to be dropped with a conflict log
      entry (`already reconciled upstream`).

## 5. Retention hygiene

- [ ] With devtools open, manually edit IndexedDB/localForage `queuedOrders` entries to simulate a
      `queuedAt` timestamp older than 72h. Reload the app.
- [ ] Ensure the debug panel reports a maintenance log (`Removed … outside the retention window`)
      and the stale entries are gone.

> Repeat sections as needed when working on offline or reconciliation features to ensure the buffer
> remains durable and observable.
