# app/api/webhooks — your receivers live here

Each event source gets one route: `app/api/webhooks/<source>/route.ts`. The **file path becomes the public URL** (e.g. `/api/webhooks/shopify`).

Copy [`../../../templates/receiver.route.template.ts`](../../../templates/receiver.route.template.ts) to `<source>/route.ts` and wire the verifier for your source. The receiver's only job: **verify → `tasks.trigger()` → 200.** The slow work runs in the task, not here.
