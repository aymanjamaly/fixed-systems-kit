import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyShopify, verifyHmac, verifyTelegram } from "../src/framework/verify";

describe("verify", () => {
  const secret = "shhh";
  const body = Buffer.from(JSON.stringify({ id: 1, hello: "world" }));

  it("verifyShopify accepts a correct base64 HMAC and rejects tampering", () => {
    const sig = createHmac("sha256", secret).update(body).digest("base64");
    expect(verifyShopify(body, sig, secret)).toBe(true);
    expect(verifyShopify(body, sig.slice(0, -2) + "xy", secret)).toBe(false);
    expect(verifyShopify(body, null, secret)).toBe(false);
    expect(verifyShopify(body, sig, "")).toBe(false);
  });

  it("verifyHmac accepts a correct hex HMAC and strips a sha256= prefix", () => {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyHmac(body, sig, secret)).toBe(true);
    expect(verifyHmac(body, `sha256=${sig}`, secret)).toBe(true);
    expect(verifyHmac(body, "deadbeef", secret)).toBe(false);
  });

  it("verifyTelegram compares the secret token in constant time", () => {
    expect(verifyTelegram("tok", "tok")).toBe(true);
    expect(verifyTelegram("tok", "nope")).toBe(false);
    expect(verifyTelegram(null, "tok")).toBe(false);
  });
});
