import { verifyShopify, verifyTelegram, verifyHmac } from "./verify";

// A trigger tells the framework how a system starts — and, for events, how to
// verify the request and where the stable idempotency id lives. Adding a source
// means adding one builder here; every system that uses it gets verify + dedup free.

export interface EventTrigger {
  kind: "event";
  /** Env var holding this source's verify secret (read in the receiver). */
  secretEnv: string;
  /** Prove the raw request is really from the source. */
  verify: (raw: Buffer, headers: Headers, secret: string) => boolean;
  /** The stable id used for idempotency (order id, message id, booking uid). */
  extractId: (payload: any) => string | number | null | undefined;
  /** Optional normalisation before validation/handoff (e.g. un-nest a payload). */
  parse?: (payload: any) => any;
}

export interface ScheduleTrigger {
  kind: "schedule";
  cron: string;
}

export type Trigger = EventTrigger | ScheduleTrigger;

/** Shopify webhook — HMAC-SHA256 (base64) over the raw body, plus a topic match. */
export const shopify = (opts: { topic: string }): EventTrigger => ({
  kind: "event",
  secretEnv: "SHOPIFY_WEBHOOK_SECRET",
  verify: (raw, h, s) => verifyShopify(raw, h.get("x-shopify-hmac-sha256"), s) && h.get("x-shopify-topic") === opts.topic,
  extractId: (p) => p.id,
});

/** Telegram bot — verifies the secret_token you set on setWebhook (no body hash). */
export const telegram = (): EventTrigger => ({
  kind: "event",
  secretEnv: "TELEGRAM_SECRET_TOKEN",
  verify: (_raw, h, s) => verifyTelegram(h.get("x-telegram-bot-api-secret-token"), s),
  extractId: (p) => p.update_id,
});

/** Cal.com booking — HMAC-SHA256 (hex); the booking is nested under `payload`. */
export const cal = (): EventTrigger => ({
  kind: "event",
  secretEnv: "CAL_WEBHOOK_SECRET",
  verify: (raw, h, s) => verifyHmac(raw, h.get("x-cal-signature-256"), s),
  parse: (p) => p.payload ?? p,
  extractId: (p) => (p.payload ?? p).uid,
});

/** Generic HMAC-SHA256 source. Configure the header, secret env, and id field. */
export const webhook = (opts: { secretEnv?: string; header?: string; idField?: string } = {}): EventTrigger => ({
  kind: "event",
  secretEnv: opts.secretEnv ?? "SOURCE_WEBHOOK_SECRET",
  verify: (raw, h, s) => verifyHmac(raw, h.get(opts.header ?? "x-signature"), s),
  extractId: (p) => p[opts.idField ?? "id"],
});

/** A cron schedule — a pull system, no receiver. */
export const schedule = (cron: string): ScheduleTrigger => ({ kind: "schedule", cron });
