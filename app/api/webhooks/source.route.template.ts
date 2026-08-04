import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { verifyHmac } from "@/src/lib/verify";
import type { eventTemplate } from "@/src/trigger/task.template";

// RECEIVER for an event source. Its ONLY job: verify → tasks.trigger() → 200. Fast.
// Copy to app/api/webhooks/<source>/route.ts — the file path becomes the public URL,
// e.g. https://your-app.vercel.app/api/webhooks/<source>.
export async function POST(req: NextRequest) {
  // 1. Read the RAW body (bytes). Needed to verify the signature. Do NOT parse yet.
  const raw = await req.text();

  // 2. VERIFY — prove it's really from the source, before doing anything.
  //    Swap verifyHmac for verifyShopify / verifyTelegram to match your source.
  const ok = verifyHmac(raw, req.headers.get("x-signature"), process.env.SOURCE_WEBHOOK_SECRET ?? "");
  if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });

  // 3. Parse and hand off. Keep the payload minimal — send what the task needs.
  const event = JSON.parse(raw);
  const id = event.id ?? crypto.randomUUID();

  await tasks.trigger<typeof eventTemplate>("event-template", event, {
    idempotencyKey: `event-${id}`, // same event twice → one run
    idempotencyKeyTTL: "30d",
  });

  // 4. Ack fast. The real work runs async in the task.
  return NextResponse.json({ received: true });
}
