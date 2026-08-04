import { defineSystem, schedule } from "@/src/framework";

// SCHEDULED · every morning, pull Hacker News' top 5 and post a digest.
// A real, working system — no stub, no API key. Swap the source for your own.
export const hnDigest = defineSystem({
  id: "hn-digest",
  trigger: schedule("0 7 * * *"), // 07:00 UTC daily
  run: async (_payload, { actions }) => {
    const ids = (await (await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")).json()) as number[];
    const stories = await Promise.all(
      ids.slice(0, 5).map(async (id) => {
        const s = (await (await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)).json()) as {
          title: string;
          score: number;
          url?: string;
        };
        return s;
      }),
    );

    const lines = stories.map((s, i) => `${i + 1}. ${s.title} (${s.score}▲) ${s.url ?? ""}`.trim());
    await actions.slack(`📰 *Hacker News — top 5*\n${lines.join("\n")}`);
    return { count: stories.length };
  },
});
