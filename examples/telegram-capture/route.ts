import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { verifyTelegram } from "../../src/lib/verify";
import type { telegramCapture } from "./task";

// RECEIVER. When deploying, this goes to app/api/webhooks/telegram/route.ts
// (the path becomes the URL you point Telegram's setWebhook at).
export async function POST(req: NextRequest) {
  const raw = await req.text();

  // VERIFY — Telegram echoes the secret you gave setWebhook in this header.
  if (!verifyTelegram(req.headers.get("x-telegram-bot-api-secret-token"), process.env.TELEGRAM_SECRET_TOKEN ?? "")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const update = JSON.parse(raw);
  const msg = update.message;
  if (!msg?.text) return NextResponse.json({ received: true }); // ignore non-text updates

  await tasks.trigger<typeof telegramCapture>(
    "telegram-capture",
    { chatId: msg.chat.id, text: msg.text },
    { idempotencyKey: `tg-${update.update_id}`, idempotencyKeyTTL: "7d" },
  );

  return NextResponse.json({ received: true });
}
