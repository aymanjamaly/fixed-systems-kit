import { task } from "@trigger.dev/sdk";
import { notifySlack } from "../lib/actions";

// EVENT task — the engine. The receiver triggers it via
// tasks.trigger("event-template", payload, { idempotencyKey }).
// It runs your steps, in order, and lands the action. It does NOT know or care
// which source fired it — it just gets a payload.
export const eventTemplate = task({
  id: "event-template",
  run: async (payload: any) => {
    // 1. STEPS — your engine, in order.
    // const enriched = await step1(payload);
    // const result = step2(enriched);

    // 2. ACTION — through actions.ts, never inline.
    await notifySlack(`Event handled: ${JSON.stringify(payload).slice(0, 200)}`);

    return { ok: true };
  },
});
