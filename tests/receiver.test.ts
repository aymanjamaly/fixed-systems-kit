import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";

// Mock the SDK so the receiver doesn't try to reach Trigger.dev.
const trigger = vi.fn().mockResolvedValue({ id: "run_1" });
vi.mock("@trigger.dev/sdk", () => ({
  tasks: { trigger: (...args: unknown[]) => trigger(...args) },
  task: (config: unknown) => config,
  schedules: { task: (config: unknown) => config },
}));

import { handleWebhook } from "../src/framework/receiver";
import { register } from "../src/framework/registry";
import { webhook } from "../src/framework/triggers";

const SECRET = "s3cr3t";

beforeEach(() => {
  trigger.mockClear();
  process.env.SOURCE_WEBHOOK_SECRET = SECRET;
  register({ id: "t", trigger: webhook() });
});

function reqFor(body: object, sig?: string): Request {
  const raw = Buffer.from(JSON.stringify(body));
  const headers = new Headers();
  if (sig !== undefined) headers.set("x-signature", sig);
  return new Request("http://x/api/webhooks/t", { method: "POST", body: raw, headers });
}
const signHex = (body: object) => createHmac("sha256", SECRET).update(Buffer.from(JSON.stringify(body))).digest("hex");

describe("handleWebhook", () => {
  it("401 on a bad signature, and never triggers", async () => {
    const res = await handleWebhook("t", reqFor({ id: 1 }, "bad"));
    expect(res.status).toBe(401);
    expect(trigger).not.toHaveBeenCalled();
  });

  it("400 when the payload has no stable id", async () => {
    const body = { noId: true };
    const res = await handleWebhook("t", reqFor(body, signHex(body)));
    expect(res.status).toBe(400);
    expect(trigger).not.toHaveBeenCalled();
  });

  it("triggers once with a per-event idempotency key on a valid request", async () => {
    const body = { id: 99 };
    const res = await handleWebhook("t", reqFor(body, signHex(body)));
    expect(res.status).toBe(200);
    expect(trigger).toHaveBeenCalledWith("t", body, expect.objectContaining({ idempotencyKey: "t-99" }));
  });

  it("404 on an unknown system", async () => {
    const res = await handleWebhook("nope", reqFor({ id: 1 }));
    expect(res.status).toBe(404);
  });
});
