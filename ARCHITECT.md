# Architect a system (read this before you build)

You don't start by coding. You start by *seeing the shape*. This is the whole design workflow — five minutes on paper saves an hour of rebuilding.

Diagrams for each idea below live in [`diagrams/`](diagrams/). Open them.

---

## 1. Every fixed system is the same four-part chain

```
Source  →  Trigger  →  Engine  →  Action
```

- **Source** — where the signal comes from (a clock, a form, a store, a message).
- **Trigger** — the "go now" signal. *This is the only piece that changes between the two kinds of system.*
- **Engine** — runs your steps, in order. Retries if a step fails.
- **Action** — the outcome that lands in the real world (a message, a row, a doc, an email).

Learn this once and it fits every automation you'll ever build.
→ `diagrams/the-four-part-chain.png`

---

## 2. The determinism gate — should this even be a fixed system?

Ask one question:

> **Does the right action change based on something the system would have to *judge* about the input?**

- **No** → the steps are the same every time → **fixed system.** Build it with this kit.
- **Yes** → the action depends on a judgment call that varies → that's an **agentic** system. Different tool. Don't force it here.

A branch you wrote (`if paid → X, else → Y`) is **still fixed** — you decided the fork in advance. It only becomes agentic when *the system itself* decides what to do from a set of options, per input, in a way you couldn't script.

**Fixed is the default.** ~90% of real systems are fixed. Reach for agentic deliberately, not by habit.

---

## 3. Pick the trigger: scheduled or event? (push vs pull)

The trigger is the whole difference between the two kinds of fixed system.

| | **Scheduled** | **Event-triggered** |
|---|---|---|
| Fires on | a clock | something happening |
| Who decides *when* | **you** ("every morning at 8") | **reality** ("the moment X happens") |
| Source type | **pull** — you go get the data | **push** — a webhook lands on you |
| Needs a receiver? | No — the scheduler fires the task directly | **Yes** — a webhook has to be *caught* first |
| Best for | recurring, predictable work | real-time reactions |

The listening cue: if you'd say **"every…"** it's scheduled; if you'd say **"the moment…"** or **"whenever…"** it's event-triggered.

→ `diagrams/scheduled-vs-event.png`

**No webhook on the source?** (e.g. you want competitor prices, or Gmail.) Then it's a **pull** — poll it on a **schedule** with a saved cursor. A webhook is just one transport; the real axis is push vs pull.

---

## 4. The lifecycle: THINK → DESIGN → BUILD → TEST

Every system, same four moves.

1. **Think** — the one question: does this run on a clock, or when something happens? Get this wrong and the whole system is wrong.
2. **Design** — map the chain on paper: source → trigger → each step → action. Fill [`system-spec.template.md`](system-spec.template.md). *No building yet.* This is the real work.
3. **Build** — hand the spec to Claude Code. Plan quality **is** build quality.
4. **Test** — fire it once on purpose and watch every step land. Not done until you've seen it run end to end — and confirmed it doesn't double-fire.

→ `diagrams/the-build-lifecycle.png`

---

## 5. Two non-negotiables for event systems

Both are handled by the kit's primitives, but you must know *why*:

- **Verify the source.** A public webhook URL can be hit by anyone. The receiver must check the request is really from the source (a signature or a shared secret) before doing anything. See [`src/lib/verify.ts`](src/lib/verify.ts).
- **Idempotency.** Sources retry. The same event can arrive twice. Key each run on a stable ID so a repeat produces **one** action, not two. See the `idempotencyKey` in [`src/trigger/task.template.ts`](src/trigger/task.template.ts).

---

## Where the systems run (so "deploy" isn't magic)

Your code is just text until a **runtime** executes it. Your runtime is **Node.js** — the same engine on your laptop and in the cloud. What changes is the **host** that keeps it alive:

- **Trigger.dev** — the host for your **tasks**: durable, retryable, can wait days between steps.
- **Vercel** — the host for your **receiver**: a public URL that answers each webhook fast.

Same runtime (Node), two hosts. "Deploying" just means handing your code to a host that keeps the runtime alive so your system runs without you.

---

Now open [`system-spec.template.md`](system-spec.template.md) and design your system.
