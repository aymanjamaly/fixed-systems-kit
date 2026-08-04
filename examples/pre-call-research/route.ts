import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { verifyHmac } from "../../src/lib/verify";
import type { preCallResearch } from "./task";

// RECEIVER for a Cal.com booking webhook. Deploy to app/api/webhooks/cal/route.ts.
export async function POST(req: NextRequest) {
  const raw = await req.text();

  // VERIFY — Cal.com signs with your webhook secret (HMAC-SHA256, hex).
  if (!verifyHmac(raw, req.headers.get("x-cal-signature-256"), process.env.SOURCE_WEBHOOK_SECRET ?? "")) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const evt = JSON.parse(raw);
  const b = evt.payload ?? evt; // Cal.com nests the booking under `payload`

  await tasks.trigger<typeof preCallResearch>(
    "pre-call-research",
    { uid: b.uid, email: b.attendees?.[0]?.email, startTime: b.startTime },
    { idempotencyKey: `booking-${b.uid}`, idempotencyKeyTTL: "30d" },
  );

  return NextResponse.json({ received: true });
}
