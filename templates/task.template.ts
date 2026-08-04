import { task } from "@trigger.dev/sdk";
import { notifySlack } from "@/src/lib/actions";

// EVENT task — the engine. The receiver triggers it via
// tasks.trigger("event-template", payload, { idempotencyKey }).
//
// ⚠️ TEMPLATE. Copy this into `src/trigger/` (and rename) before use. It does not
//    register as a task while it lives here in templates/ — that's deliberate.
export const eventTemplate = task({
  id: "event-template",
  run: async (payload: any) => {
    // 1. STEPS — your engine, in order.
    // 2. ACTION — through actions.ts, never inline.
    await notifySlack(`Event handled: ${JSON.stringify(payload).slice(0, 200)}`);
    return { ok: true };
  },
});
