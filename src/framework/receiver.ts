import { tasks } from "@trigger.dev/sdk";
import { getSystem } from "./registry";

// The single webhook handler behind app/api/webhooks/[system]/route.ts.
// Verify → normalise → dedup → trigger. One implementation for every event system.
export async function handleWebhook(systemId: string, req: Request): Promise<Response> {
  const sys = getSystem(systemId);
  if (!sys || sys.trigger.kind !== "event") {
    return json({ error: `unknown event system: ${systemId}` }, 404);
  }
  const trigger = sys.trigger;

  // Raw bytes — the source signed the exact bytes; a re-encoded string can drift.
  const raw = Buffer.from(await req.arrayBuffer());

  const secret = process.env[trigger.secretEnv] ?? "";
  if (!trigger.verify(raw, req.headers, secret)) {
    return json({ error: "bad signature" }, 401);
  }

  let payload: any = JSON.parse(raw.toString("utf8"));
  if (trigger.parse) payload = trigger.parse(payload);

  const id = trigger.extractId(payload);
  if (id == null) {
    // No stable id = can't dedup. Fail loud rather than silently allow duplicates.
    return json({ error: "no stable id for idempotency" }, 400);
  }

  await tasks.trigger(sys.id, payload, {
    idempotencyKey: `${sys.id}-${id}`,
    idempotencyKeyTTL: "30d",
  });

  return json({ received: true });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
