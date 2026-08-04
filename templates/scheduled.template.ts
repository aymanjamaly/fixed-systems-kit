import { schedules } from "@trigger.dev/sdk";
import { notifySlack } from "@/src/lib/actions";

// SCHEDULED (pull) system — runs on a clock. No receiver needed.
//
// ⚠️ TEMPLATE. Copy this into `src/trigger/` (and rename) before use.
//    Templates live OUTSIDE the trigger `dirs` on purpose so they never deploy
//    as phantom tasks. The `cron` is commented out too — a copied task can't fire
//    on a schedule you didn't choose. Set it when you're ready.
export const scheduledTemplate = schedules.task({
  id: "scheduled-template",
  // cron: "0 9 * * *",   // ← set your cadence (e.g. every day 09:00 UTC), then deploy
  run: async (payload) => {
    // 1. PULL — go and get the data (fetch an API, scrape, read a sheet).
    // 2. STEPS — your engine, in order (filter, transform, compose).
    // 3. ACTION — what lands in the real world (through actions.ts).
    await notifySlack("Scheduled system ran ✅");
    return { ranAt: payload.timestamp };
  },
});
