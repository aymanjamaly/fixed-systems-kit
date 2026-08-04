import { schedules } from "@trigger.dev/sdk";
import { notifySlack } from "../lib/actions";

// SCHEDULED (pull) system — runs on a clock. No receiver needed: the Trigger.dev
// scheduler fires this task directly. Copy this file, rename it, set the cron.
export const scheduledTemplate = schedules.task({
  id: "scheduled-template",
  cron: "0 9 * * *", // every day at 09:00 UTC — change to your cadence
  run: async (payload) => {
    // payload.timestamp = when this run fired

    // 1. PULL — go and get the data (fetch an API, scrape, read a sheet).
    // const data = await pull();

    // 2. STEPS — your engine, in order (filter, transform, compose).
    // const result = compose(data);

    // 3. ACTION — what lands in the real world (through actions.ts).
    await notifySlack("Scheduled system ran ✅");

    return { ranAt: payload.timestamp };
  },
});
