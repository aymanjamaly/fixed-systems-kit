# CLAUDE.md — how to build a system in this repo

You are building **fixed (deterministic) systems** on Trigger.dev from a student's spec. Your job is to **assemble** a system from the primitives already in this repo — not to engineer from scratch. The student is the architect; you are the builder.

## When the student says "build the system in my spec"

1. **Read their spec** (`system-spec.template.md`, filled in). If any of the five fields — source, trigger, steps, action, verify — is missing or vague, ask one batched clarifying question, then proceed.

2. **Run the determinism gate.** If the "steps" require judgment that changes the action per input in a way that can't be written as a rule, **stop and say so** — that's an agentic system, not a fixed one, and this kit is the wrong tool. Otherwise continue.

3. **Draw their system** — before writing code. Import `systemBoard` from `diagram.mjs` and call it with their chain (`{ name, triggerType, source, steps, action, verify }`) to write `diagrams/<system>.excalidraw`. The student opens it to see a diagram of **their own** system. It doubles as a design check: if the chain won't draw cleanly, the spec isn't finished. **Never hand them the kit's own diagrams — generate one for their system.**

4. **Pick the pattern from the trigger:**
   - **Scheduled** → copy `templates/scheduled.template.ts` → `src/trigger/`. Set the `cron`. No receiver needed.
   - **Event-triggered** → copy **two** files:
     - the task: `templates/task.template.ts` → `src/trigger/`
     - the receiver: `templates/receiver.route.template.ts` → `app/api/webhooks/<source>/route.ts`

5. **Wire the pieces** (in this order):
   - **Verify** (event only): use the matching verifier from `src/lib/verify.ts` in the receiver. Never process an unverified webhook. If the source isn't covered, use `verifyHmac` (generic) or add a small verifier beside the others.
   - **Payload**: the receiver reads the **raw body**, verifies, parses, then calls `tasks.trigger("<task-id>", payload, { idempotencyKey })`. Keep the payload minimal — send what the task needs, not the whole blob.
   - **Idempotency**: derive `idempotencyKey` from a stable ID in the payload (order id, message id, booking id). This is non-negotiable — sources retry.
   - **Steps**: implement the student's steps, in order, inside the task's `run`. One responsibility per helper.
   - **Action**: use `src/lib/actions.ts` (`notifySlack`, `sendTelegram`, `writeNotion`, `sendEmail`). Add a new action there if needed — don't inline it in the task.

6. **Deploy + test** (see "Definition of done").

## Hard rules

- **Fixed only.** You decide the steps here. No LLM step that *chooses the action*. (An LLM doing a fixed sub-task — summarize, classify into a set list, draft — is fine; that's still a fixed step you chose.)
- **Verify before you parse.** Read the raw body, check the signature/secret, *then* `JSON.parse`. Verifying after parsing is a bug.
- **Ack fast, work async.** The receiver's only job is verify → `tasks.trigger()` → return `200`. Never do the slow work in the route. It runs in the task.
- **Every action lands through `actions.ts`.** Keep side effects in one place so they're easy to gate, swap, and audit.
- **Match the existing style.** Read a neighbouring file before writing; mirror its shape. No new dependencies unless the spec truly needs one.
- **Secrets split by home.** The receiver (Vercel) holds only its source-verify secret + `TRIGGER_SECRET_KEY`. The task (Trigger.dev) holds its own action keys. Put each where it runs. Never commit `.env`.

## Definition of done

A system is **not** done until you can show all four:

1. It **fired end-to-end on its own** — scheduled: ran on the clock (or `test`); event: a real fired webhook flowed through.
2. The receiver **rejected a forged request** (bad/absent signature → `401`).
3. The **same event twice** produced **one** action (idempotency held).
4. You pointed at the **run in the Trigger.dev dashboard** as proof — not "it should have worked."

If you can't show those four, say what's missing plainly. Don't declare it done.

## The mental model to keep

```
Source → Trigger → Engine (your steps) → Action
```

Runtime is Node.js in both homes. Trigger.dev hosts the durable **task**; Vercel hosts the fast **receiver**. Deploying = handing your code to a host that keeps the runtime alive so the system runs without the student.
