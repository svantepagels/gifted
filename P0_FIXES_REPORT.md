# P0 Fixes Report

Follow-up work on `OPUS47_CODE_REVIEW.md`. Payment processor integration was
explicitly out of scope and is **still** a hard launch blocker — without it,
`/api/reloadly/order` will happily dispense real gift cards for $0.

All other P0 items are done. Build passes cleanly (`npm run build`).
`npx tsc --noEmit` is clean except for pre-existing errors in
`lib/__tests__/rate-limit.security.test.ts` that were present before this
work and were not touched here.

## Done

### 1. Real database for orders (Upstash Redis)
- New `lib/orders/repository.ts` with an `OrderRepository` interface and two
  implementations:
  - `RedisOrderRepository` — Upstash Redis (already wired via
    `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). Orders persist
    for 7 days (long enough for support, short enough that stale records
    auto-evict).
  - `MemoryOrderRepository` — local-dev fallback when env vars are missing.
    In `NODE_ENV=production` with no Redis, the repo throws instead of
    silently losing data on cold starts.
- Order IDs now use `crypto.randomUUID()` (was `Math.random()`).
- `substr` → `slice`. Deprecated API is gone.
- Interface stayed stable; only the implementation and call sites changed.
- `lib/orders/mock-repository.ts` is deleted.

### 2. Server-owned order lifecycle
The client used to import `orderRepository` directly and drive the state
machine from the browser. That's what made `browser-storage.ts` the de facto
source of truth. Fixed:
- `POST /api/orders` — creates a pending order. Zod-validated body.
- `GET /api/orders/:id` — fetches an order. Rate-limited.
- `POST /api/reloadly/order` — rewritten. Now does the full server-side
  fulfillment: load order from Redis, re-validate `unitPrice`, call Reloadly,
  update order status / payment / fulfillment, return transaction ID.
- `lib/orders/api.ts` — thin client helpers (`createOrder`, `fetchOrder`,
  `processOrder`) that the UI uses.
- `lib/orders/browser-storage.ts` — reduced to a pure optimistic cache.
  Explicitly documented as non-authoritative.
- `ProductDetailClient.tsx`, `app/checkout/page.tsx`, `app/success/page.tsx`
  all talk to the API instead of importing the server-side repo.

### 3. Success page copy
Completely rewritten `components/success/SuccessSummary.tsx`:
- No more "Gift Card Code: Transaction ID: N". That was a support-ticket
  generator.
- New sections explain how delivery works: Reloadly emails the code directly
  to the recipient, expected window 5 min (up to 1 hour during peak), what
  to do if it doesn't arrive.
- Transaction ID is surfaced as a "Reference number" with an italic subtitle
  clarifying it's for support, not a redemption code.
- Layout stays in the existing design language.

### 4. PII out of Sentry
`app/api/reloadly/order/route.ts`:
- Dropped the per-order `captureMessage('Gift card order placed')`
  entirely. A comment explains the decision: Sentry is for errors, not
  business telemetry; wire PostHog when we need the latter.
- No more `recipientEmail` or raw IP in `extra`.
- Uncaught errors still go through `captureException`, but with zero PII in
  the payload.

`sentry.server.config.ts` and `sentry.client.config.ts`:
- Added a `PII_KEYS` set and a `scrubPII` helper that both `beforeSend`
  hooks run across `extra`, `contexts`, and breadcrumb `data`. Scrubs
  `email`, `recipientEmail`, `customerEmail`, `senderEmail`, `phone`,
  `phoneNumber`, `ip`, `ipAddress`. Defense-in-depth against future
  accidental leaks.
- Server config also strips `UPSTASH_REDIS_REST_TOKEN` from runtime env
  in addition to the existing Reloadly credentials.

### 5. Server-side validation of `unitPrice`
`app/api/reloadly/order/route.ts` now:
- Looks up the order from Redis (authoritative).
- Fetches the matching product via a new
  `giftCardService.getProductByReloadlyId()` helper (reuses the cached
  catalog).
- For FIXED denominations: compares `order.amount` to
  `product.fixedDenominations` with a 0.005 epsilon for float safety.
- For RANGE denominations: checks `min <= amount <= max`.
- Rejects with 400 if validation fails.
- Rejects with 409 if the order has already been completed (defends against
  double-clicks after a successful call).

### 6. Repo cleanup
- Deleted 186 swarm-deliverable `.md` files at the root. Kept only
  `README.md` and `OPUS47_CODE_REVIEW.md`. (No `ARCHITECTURE.md` or
  `CHECKOUT.md` re-created — the existing `README.md` is already solid and
  the old ARCHITECTURE.md was 70k of agent slop, not useful docs.)
- Deleted dead code:
  - `lib/giftcards/service-reloadly.ts` (duplicate class with same singleton name)
  - `lib/giftcards/reloadly-adapter.ts` (200-line stub)
  - `lib/payments/mock-checkout.ts` (mock codes like `1234-5678-9012-3456`)
  - `lib/payments/lemon-squeezy-adapter.ts` (170-line commented TODO)
  - `lib/payments/service.ts` (unused wrapper)
  - `lib/payments/reloadly-checkout.ts` (moved into the API route)
  - `lib/payments/types.ts` (orphaned after the above)
  - `lib/payments/` directory is now gone
  - `lib/orders/service.ts` (unused, had the stale 3.5% fee formula)
  - `lib/orders/mock-repository.ts` (replaced by `repository.ts`)
- Deleted all `test-*.ts`, `test-*.mjs`, `verify-*.ts`, `audit-*.ts` at the
  repo root and the `test-product-images/` image-generation experiments.

### 7. Single service-fee formula
- `lib/utils/currency.ts` (`5% + $1`) is now the only place this is defined.
- The stale 3.5% copy in `lib/orders/service.ts` was deleted along with the
  rest of that unused file.
- Added a comment at `calculateServiceFee` marking it as the single source of
  truth.

## Commit log
```
330b6a3 chore(currency): document calculateServiceFee as the single source of truth
6ab8af2 fix(sentry): scrub PII from events globally as defense-in-depth
12df825 fix(success): stop showing transaction ID as a redeemable gift code
566a5e8 feat(orders): persist orders in Upstash Redis instead of in-memory Map
b0518e7 chore: delete dead code and one-shot test/verify scripts
2d95bfb chore: remove 186 swarm deliverable markdown files
```

## Known issues, still open

These were flagged by OPUS47 and remain — out of scope for this pass, or
tangled with the payment integration that's deferred.

- **Payment processing.** The #1 launch blocker. `/api/reloadly/order` still
  takes $0 and hands out a real card. Must be gated behind a successful
  payment webhook before this goes anywhere near a real customer. Svante is
  handling this separately.
- **No idempotency key.** Added a 409 on already-completed orders, but
  that's a best-effort guard. A real idempotency scheme (e.g. a Redis SET
  NX on `customIdentifier` for the Reloadly call) should land alongside
  the payment integration.
- **Webhook endpoint for async Reloadly PENDING → FAILED transitions.** If
  Reloadly later flips a PENDING order to FAILED, we have no way to notify
  the user. Needs `/api/webhooks/reloadly/*` + email.
- **`alert()` error UX** in `ProductDetailClient.tsx` remains (P1).
- **48 `console.log`s** across the codebase (P1). I did not add any new
  ones in this pass, and removed logs from the files I touched. A sweep is
  still needed.
- **`useState(() => { setCartProduct(product) })`** antipattern in
  `ProductDetailClient.tsx:29-31` — flagged by the review, not touched here
  because the request was surgical scope and the render path didn't need
  changing to make the P0 fixes work.
- **Category vocabulary mismatch** between `transform.ts`, `ProductCard`,
  `CategoryChips`, `Footer`, and the Tailwind theme. Three vocabularies.
  Untouched.
- **Brand logos** still render as a single-letter placeholder. Untouched.
- **`lib/__tests__/rate-limit.security.test.ts` has 4 pre-existing TS
  errors.** Unrelated to this work. Flagged for the test-health pass.
- **Instrumentation checks `SENTRY_DSN` but code uses `NEXT_PUBLIC_SENTRY_DSN`.**
  Unchanged; out of this scope.

## Env-var requirements to run in production

Same as before, plus now strictly required:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without these, in `NODE_ENV=production` the order repository will throw on
first access rather than silently losing data. In dev, it falls back to an
in-memory Map (non-persistent between restarts — fine for clicking around).

## Verification

- `npm run build` → passes, 56 static pages generated, all API routes listed
  including the two new ones (`/api/orders`, `/api/orders/[id]`).
- `npx tsc --noEmit` → clean except for the pre-existing test-file errors
  documented above.
- Manual dataflow audit:
  - `ProductDetailClient` → `createOrder()` → `POST /api/orders` → Redis.
  - `/checkout` → `fetchOrder()` → `GET /api/orders/:id` → Redis.
  - `/checkout` → `processOrder()` → `POST /api/reloadly/order` → validates
    against product denominations → calls Reloadly → updates Redis.
  - `/success` → `fetchOrder()` → renders new copy.
- No client bundle now imports the server-side repository. Verified with
  grep: `orderRepository` only appears in server-side files.
