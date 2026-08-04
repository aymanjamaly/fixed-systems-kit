import { createHmac, timingSafeEqual } from "node:crypto";

// Prove a webhook is really from its source. ALWAYS verify over the RAW BODY,
// BEFORE JSON.parse. Pass the raw bytes (Buffer) from `req.arrayBuffer()` — the
// source signed the exact bytes, so a re-encoded string can silently fail to match.
type Body = string | Buffer;

/** Shopify: base64 HMAC-SHA256 of the raw body; header `x-shopify-hmac-sha256`. */
export function verifyShopify(rawBody: Body, headerHmac: string | null, secret: string): boolean {
  if (!headerHmac || !secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
  return safeEqual(digest, headerHmac);
}

/** Telegram: it echoes the secret you passed to setWebhook in `X-Telegram-Bot-Api-Secret-Token` (no body hash). */
export function verifyTelegram(headerToken: string | null, secret: string): boolean {
  if (!headerToken || !secret) return false;
  return safeEqual(headerToken, secret);
}

/** Generic HMAC-SHA256 (Cal.com, custom sources). Strips a leading `sha256=` if present. */
export function verifyHmac(
  rawBody: Body,
  headerSig: string | null,
  secret: string,
  encoding: "hex" | "base64" = "hex",
): boolean {
  if (!headerSig || !secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest(encoding);
  return safeEqual(digest, headerSig.replace(/^sha256=/, ""));
}

// Constant-time compare. The length check can reveal that two values differ in
// LENGTH (not content) — a deliberate tradeoff, harmless for the fixed-length
// hex/base64 digests compared here.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
