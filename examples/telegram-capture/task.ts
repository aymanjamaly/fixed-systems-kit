import { task } from "@trigger.dev/sdk";
import { sendTelegram, writeNotion } from "../../src/lib/actions";

// EVENT: a message hits your bot → capture it → save to Notion → confirm back.
export const telegramCapture = task({
  id: "telegram-capture",
  run: async (payload: { chatId: number; text: string }) => {
    const { chatId, text } = payload;

    // 1. STEPS — treat the message as an idea to capture.
    //    (Swap for fetch+summarize if `text` is a URL.)
    const title = text.slice(0, 80);

    // 2. ACTION — save, then confirm to the user.
    if (process.env.NOTION_DATABASE_ID) {
      await writeNotion(process.env.NOTION_DATABASE_ID, {
        Name: { title: [{ text: { content: title } }] },
        Note: { rich_text: [{ text: { content: text } }] },
      });
    }
    await sendTelegram(chatId, `Saved ✅ _"${title}"_`);
    return { saved: true };
  },
});
