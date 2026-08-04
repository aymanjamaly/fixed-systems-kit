// Actions — what a system lands in the real world. Injected into `run` as `ctx.actions`.
// Each throws on failure so Trigger.dev's retry policy engages.

export const actions = {
  /** Post to a Slack incoming webhook. */
  async slack(text: string): Promise<void> {
    await post(env("SLACK_WEBHOOK_URL"), { text });
  },
  /** Send a Telegram message (Markdown). */
  async telegram(chatId: string | number, text: string): Promise<void> {
    await post(`https://api.telegram.org/bot${env("TELEGRAM_BOT_TOKEN")}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    });
  },
  /** Create a page (row) in a Notion database. `properties` follows the Notion API shape. */
  async notion(databaseId: string, properties: Record<string, unknown>): Promise<void> {
    await post(
      "https://api.notion.com/v1/pages",
      { parent: { database_id: databaseId }, properties },
      { Authorization: `Bearer ${env("NOTION_API_KEY")}`, "Notion-Version": "2022-06-28" },
    );
  },
  /** Send an email via Resend. */
  async email(to: string, subject: string, html: string): Promise<void> {
    await post(
      "https://api.resend.com/emails",
      { from: env("FROM_EMAIL"), to, subject, html },
      { Authorization: `Bearer ${env("RESEND_API_KEY")}` },
    );
  },
};

export type Actions = typeof actions;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function post(url: string, body: unknown, headers: Record<string, string> = {}): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${new URL(url).host} ${res.status}: ${await res.text().catch(() => "")}`);
  }
}
