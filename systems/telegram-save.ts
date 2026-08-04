import { defineSystem, telegram } from "@/src/framework";
import { TelegramUpdate } from "./schemas";

// EVENT · message your bot a link → it fetches the page title → replies with it.
// Real work: it actually fetches and parses the <title>.
export const telegramSave = defineSystem({
  id: "telegram-save",
  trigger: telegram(),
  input: TelegramUpdate,
  run: async (update, { actions }) => {
    const msg = update.message;
    if (!msg?.text) return { skipped: true };

    const url = msg.text.match(/https?:\/\/\S+/)?.[0];
    let title = msg.text.slice(0, 100);
    if (url) {
      try {
        const html = await (await fetch(url)).text();
        title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? url;
      } catch {
        title = url; // keep the URL if the page can't be fetched
      }
    }

    await actions.telegram(msg.chat.id, `Saved ✅ _${title}_`);
    return { title };
  },
});
