# Examples — complete fixed systems

Three **reference** builds, one per shape — you **copy** them into place to run; they don't register as-is. Drop each `task.ts` into `src/trigger/`, and (for event examples) each `route.ts` into `app/api/webhooks/<source>/`. Each example's README has the exact steps. Read the one closest to what you're building.

| Example | Shape | Teaches |
|---|---|---|
| [`scheduled-digest/`](scheduled-digest/) | Scheduled (pull) | a clock-triggered task that composes and sends — no receiver |
| [`telegram-capture/`](telegram-capture/) | Event (push) | the full receiver → task chain, with verify + idempotency |
| [`pre-call-research/`](pre-call-research/) | Event + wait | a task that sleeps until just before a call, then acts (`wait.until`) |

Each is the same chain — `source → trigger → engine → action` — with only the trigger and steps different.
