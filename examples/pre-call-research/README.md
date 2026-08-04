# Example · Pre-call research (event + wait)

**Shape:** Event (push) **with a durable wait** — the best demo of *why* Trigger.dev exists.

```
Prospect books (Cal.com) → webhook → receiver verifies → task WAITS until 1h before the call → research → email the rep
```

The booking might be days away. The task **durably sleeps** with `wait.until({ date })` — no cron polling, no keeping a server awake. When the moment comes, it wakes, researches fresh, and emails. Your laptop can't do that; a durable runtime can.

**Two files:**
- `route.ts` → receiver → `app/api/webhooks/cal/route.ts`
- `task.ts` → the task (with the `wait`) → `src/trigger/`

**Note:** this is still a **fixed** system — the research is an AI *step* you chose, not a decision. It never picks its own path. That's why it belongs in this kit.

**Prove it:** book a call ~90 min out → the task waits, then the brief arrives before the call · book with a personal email → it degrades gracefully · fire the webhook twice → one brief.
