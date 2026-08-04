// Reusable actions — the things a system lands in the real world.
// Add new actions HERE; never inline a side-effect in a task. Each throws on
// failure so Trigger.dev's retry policy actually kicks in.

/** Post a message to a Slack incoming webhook. */
export async function notifySlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) throw new Error("SLACK_WEBHOOK_URL not set");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack ${res.status}`);
}

/** Send a Telegram message (Markdown). `chatId` comes from the incoming update. */
export async function sendTelegram(chatId: string | number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}`);
}

/** Create a page (row) in a Notion database. `properties` follows the Notion API shape. */
export async function writeNotion(databaseId: string, properties: Record<string, unknown>): Promise<void> {
  const key = process.env.NOTION_API_KEY;
  if (!key) throw new Error("NOTION_API_KEY not set");
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
}

/** Send an email via Resend. Swap the provider if you use another. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Email ${res.status}`);
}
