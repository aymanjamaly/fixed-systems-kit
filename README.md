# Fixed Systems Kit

A tiny framework for building **fixed (deterministic) systems** on [Trigger.dev](https://trigger.dev). One typed declaration wires the receiver, signature verification, idempotency, and the task — you write the steps.

```ts
// systems/order-alert.ts
import { defineSystem, shopify } from "@/src/framework";
import { OrderSchema } from "./schemas";

export const orderAlert = defineSystem({
  id: "order-alert",
  trigger: shopify({ topic: "orders/create" }), // verify + idempotency, built in
  input: OrderSchema,                            // zod: validates + types the payload
  run: async (order, { actions }) => {           // `order` is fully typed
    if (Number(order.total_price) >= 500) {
      await actions.slack(`Large order #${order.order_number}`);
    }
  },
});
```

That's the whole system. No route to write, no HMAC boilerplate, no idempotency key to remember.

## What one `defineSystem` gives you

- **The receiver** — a single dynamic route (`app/api/webhooks/[system]/route.ts`) serves *every* event system. You never write a route.
- **Verification** — each trigger carries its own signature/secret check, over the raw bytes.
- **Idempotency** — each trigger knows its stable id; a retried delivery runs once.
- **Validation + types** — `input` (zod) parses the payload; `run` receives typed, valid data or the request is rejected.
- **Task registration** — deploys to Trigger.dev automatically.

## Triggers

| Trigger | Source | Verifies |
|---|---|---|
| `shopify({ topic })` | Shopify webhook | HMAC-SHA256 (base64) + topic |
| `telegram()` | Telegram bot | secret token |
| `cal()` | Cal.com booking | HMAC-SHA256 (hex) |
| `webhook({ header, idField, secretEnv })` | any HMAC source | HMAC-SHA256 |
| `schedule(cron)` | a clock (pull) | — |

Adding a source = adding one builder in [`src/framework/triggers.ts`](src/framework/triggers.ts); every system that uses it gets verify + dedup for free.

## Layout

```
systems/            your systems (defineSystem) — each deploys as a Trigger.dev task
src/framework/      the engine: defineSystem · triggers · receiver · verify · actions · registry
app/api/webhooks/[system]/route.ts   one route for every event system
tests/              vitest — verify · triggers · receiver
```

## Quickstart

```bash
npm install
cp .env.example .env
npm test          # the framework is tested
npm run typecheck
npx trigger.dev@latest dev   # run your systems locally
```

**Add a system:** drop a file in `systems/`, export a `defineSystem(...)`, add it to `systems/index.ts`.
**Deploy:** `npx trigger.dev@latest deploy` (tasks) + `vercel --prod` (receiver).

Two real examples ship in [`systems/`](systems/): `order-alert` (Shopify event), `telegram-save` (Telegram event, fetches a page title), `hn-digest` (scheduled, posts Hacker News' top 5 — works with zero API keys).

## Scope

Fixed systems only: *you* decide the steps, the system runs them. When the right action needs **judgment that changes per input** — a rule you can't write in advance — that's an **agentic** system, a different tool. Fixed is the default.

MIT © Ayman Jamaly
