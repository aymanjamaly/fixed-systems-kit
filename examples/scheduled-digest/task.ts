import { schedules } from "@trigger.dev/sdk";
import { notifySlack } from "../../src/lib/actions";

// SCHEDULED (pull): every morning, gather a few numbers, compose a digest, post it.
// No receiver — the Trigger.dev scheduler fires this directly.
export const morningDigest = schedules.task({
  id: "morning-digest",
  cron: "0 7 * * *", // 07:00 UTC, daily
  run: async (payload) => {
    // 1. PULL — go get what the digest reports on.
    //    Swap fakePull() for a real fetch: a metrics API, a Google Sheet, an RSS feed.
    const items = await fakePull();

    // 2. STEPS — compose.
    const lines = items.map((i) => `• ${i.title} — ${i.value}`).join("\n");
    const message = `☀️ *Morning digest — ${new Date(payload.timestamp).toDateString()}*\n${lines}`;

    // 3. ACTION.
    await notifySlack(message);
    return { count: items.length };
  },
});

async function fakePull() {
  return [
    { title: "New leads", value: 12 },
    { title: "Revenue (yesterday)", value: "$3,410" },
    { title: "Open tickets", value: 4 },
  ];
}
