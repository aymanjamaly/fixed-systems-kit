import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { verifyHmac } from "@/src/lib/verify";
import type { eventTemplate } from "@/templates/task.template";

// RECEIVER template. ⚠️ Copy to app/api/webhooks/<source>/route.ts — the file path
// becomes the public URL. Its only job: verify → tasks.trigger() → 200. Fast.
export async function POST(req: NextRequest) {
  // 1. Read the RAW BYTES (not text). The source signed the exact bytes; re-encoding
  //    a decoded string can corrupt a non-UTF-8 payload and silently break the check.
  const raw = Buffer.from(await req.arrayBuffer());

  // 2. VERIFY before anything. Swap verifyHmac for verifyShopify / verifyTelegram per source.
  if (!verifyHmac(raw, req.headers.get("x-signature"), process.env.SOURCE_WEBHOOK_SECRET ?? "")) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw.toString("utf8"));

  // 3. Idempotency needs a STABLE id from the payload. Pick your source's real id
  //    (order id, message id, booking uid). Do NOT fall back to a random id — that
  //    silently defeats dedup and a retried delivery would run twice. Fail loud instead.
  const id = event.id; // ← replace with your source's stable id field
  if (id == null) {
    return NextResponse.json({ error: "no stable id for idempotency" }, { status: 400 });
  }

  await tasks.trigger<typeof eventTemplate>("event-template", event, {
    idempotencyKey: `event-${id}`, // same event twice → one run
    idempotencyKeyTTL: "30d",
  });

  // 4. Ack fast. The real work runs async in the task.
  return NextResponse.json({ received: true });
}
