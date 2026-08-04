# CLAUDE.md — adding a system

This repo is a small framework. To build a fixed system you write **one file** that calls `defineSystem` — the framework wires the receiver, verification, idempotency, and task registration. Do **not** hand-roll routes or HMAC checks; the framework owns them.

## To add a system

1. **Confirm it's fixed.** If the right action needs judgment that changes per input (a rule you can't write), stop — it's agentic, the wrong tool here.

2. **Draw it** (preferred): call `systemBoard({ name, triggerType, source, steps, action, verify }, "diagrams/<id>.excalidraw")` from `diagram.mjs`, so the user sees a board of *their own* system. Never hand them the repo's example diagram.

3. **Pick a trigger** from `src/framework/triggers.ts` — `shopify`, `telegram`, `cal`, `webhook` (generic HMAC), or `schedule(cron)`. If the source is new, add a builder there (`secretEnv`, `verify`, `extractId`) — one place, reused by every system.

4. **Write `systems/<id>.ts`:**
   ```ts
   import { defineSystem, webhook } from "@/src/framework";
   import { MySchema } from "./schemas";

   export const mySystem = defineSystem({
     id: "my-system",
     trigger: webhook(),
     input: MySchema,                 // zod (add it to systems/schemas.ts) — validates + types
     run: async (data, { actions }) => {
       // your steps, in order; `data` is typed from MySchema
     },
   });
   ```
   Scheduled systems omit `input`; `run` receives `{ timestamp }`.

5. **Register it:** add `export * from "./my-system";` to `systems/index.ts`.

6. **Verify:** `npm run typecheck && npm test`, then `npx trigger.dev dev` and fire it.

## Rules

- **Fixed only.** An LLM doing a fixed sub-task (summarise, classify into a set list, draft) is fine — that's a step you chose. An LLM *choosing the action* is agentic; don't build that here.
- **Never bypass the framework.** No hand-written routes, no inline HMAC, no manual `tasks.trigger` in a system file. If you need something the framework can't express, add it to `src/framework/`, not to a system.
- **Validate every event payload** with a zod schema in `input`.
- **Actions go through `ctx.actions`** (`slack` / `telegram` / `notion` / `email`). Add new ones in `src/framework/actions.ts`, never inline.
- **Match the existing style** — read a neighbouring system before writing.

## Definition of done

1. `npm run typecheck` and `npm test` pass.
2. The system fired end-to-end (event: a real webhook; scheduled: a test run).
3. A forged request → `401`; the same event twice → one run.
4. You can point at the run in the Trigger.dev dashboard — not "it should have worked."
