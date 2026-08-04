# Example · Telegram capture

**Shape:** Event (push). The cleanest first webhook — free, and you fire it yourself by texting your bot.

```
You DM the bot → Telegram webhook → receiver verifies the secret → task saves to Notion → replies "Saved ✅"
```

**Two files, two homes:**
- `route.ts` → the **receiver** (Vercel). Verify → `tasks.trigger()` → 200. Place it at `app/api/webhooks/telegram/route.ts`.
- `task.ts` → the **engine** (Trigger.dev). Runs the steps + the action. Place it at `src/trigger/`.

**Wire it up:**
1. Create a bot with `@BotFather`, get the token → `TELEGRAM_BOT_TOKEN`.
2. Pick any secret string → `TELEGRAM_SECRET_TOKEN`.
3. Point Telegram at your receiver:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/webhooks/telegram&secret_token=<TELEGRAM_SECRET_TOKEN>
   ```
4. Text your bot. Watch the run in the Trigger.dev dashboard.

**Prove it:** send a message (it saves + replies) · send a request with the wrong secret (→ 401) · send the same `update_id` twice (→ one save).
