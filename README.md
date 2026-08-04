# Fixed Systems Kit

Build **any fixed (deterministic) system** on [Trigger.dev](https://trigger.dev) — scheduled or event-triggered — fast, and actually understand what you built.

> A **fixed system** is one where *you* decide the steps and the system runs them. Same input → same steps, every time. It runs; it doesn't think. That's most of the automation a business needs — and this kit makes building it easy.

Idea → running system in minutes: **architect** it with the diagrams, **describe** it in a spec, let Claude **assemble** it from the primitives.

---

## The three moves

1. **Architect** — read [`ARCHITECT.md`](ARCHITECT.md). Learn the four-part chain, run the *determinism gate* to confirm it's a fixed system, and pick **scheduled vs event**. (When you build, Claude draws a board of *your* system — see `diagram.mjs` below.)
2. **Design** — copy [`system-spec.template.md`](system-spec.template.md), fill it in (source · trigger · steps · action · verify). No code yet — this *is* the real work.
3. **Build** — tell Claude Code: *"build the system in my spec."* [`CLAUDE.md`](CLAUDE.md) walks it through assembling the system from the primitives and deploying it.

The chain every system in this kit follows:

```
Source  →  Trigger  →  Engine (your steps, in order)  →  Action
```

Only the **trigger** changes between the two kinds of fixed system:
- **Scheduled** — runs on a clock (a *pull*: you go get the data).
- **Event-triggered** — runs when something happens (a *push*: a webhook lands).

---

## What's inside

| Path | What it is |
|---|---|
| [`diagram.mjs`](diagram.mjs) | Draws an Excalidraw board of **your** system from its chain. Claude runs it during design, so you see your *own* architecture — not a generic board |
| [`diagrams/`](diagrams/) | Where your generated system boards land (`example-system.excalidraw` shows the shape) |
| [`ARCHITECT.md`](ARCHITECT.md) | The design workflow: the chain · the determinism gate · push-vs-pull · think → design → build → test |
| [`system-spec.template.md`](system-spec.template.md) | The fill-in spec you write before building |
| [`src/lib/verify.ts`](src/lib/verify.ts) | Prove a webhook is really from its source (Shopify HMAC, Telegram secret, generic) |
| [`src/lib/actions.ts`](src/lib/actions.ts) | Ready-made actions: Slack · Telegram · Notion · email |
| [`src/trigger/scheduled.template.ts`](src/trigger/scheduled.template.ts) | The scheduled (cron) task pattern |
| [`src/trigger/task.template.ts`](src/trigger/task.template.ts) | The event task pattern (with idempotency) |
| [`app/api/webhooks/source.route.template.ts`](app/api/webhooks/source.route.template.ts) | The receiver pattern: verify → `tasks.trigger()` |
| [`examples/`](examples/) | Complete working systems you can copy |

---

## Quickstart

```bash
npm install
cp .env.example .env          # fill in TRIGGER_SECRET_KEY + any action/source secrets
npx trigger.dev@latest dev    # run tasks locally
npm run dev                   # run the Next.js receiver locally (for event systems)
```

Then follow the three moves above. When it works locally, deploy:

```bash
npx trigger.dev@latest deploy   # tasks → Trigger.dev
vercel --prod                   # receiver → Vercel (event systems only)
```

---

## The one rule

**This kit builds FIXED systems only.** You decide the steps; the system runs them. The moment a step needs *judgment that changes the action per input* — where the rule can't be written in advance — that's an **agentic** system, a different tool. Run the determinism gate in [`ARCHITECT.md`](ARCHITECT.md) before you build. Fixed is the default; reach for agentic on purpose.
