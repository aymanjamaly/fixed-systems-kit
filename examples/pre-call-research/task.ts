import { task, wait } from "@trigger.dev/sdk";
import { sendEmail } from "../../src/lib/actions";

// EVENT + WAIT: on booking, durably sleep until ~1h before the call, then research + email.
// The `wait` is the whole point — a task can sleep for DAYS between the booking and the call.
export const preCallResearch = task({
  id: "pre-call-research",
  run: async (payload: { uid: string; email?: string; startTime: string }) => {
    const callAt = new Date(payload.startTime).getTime();
    const runAt = new Date(callAt - 60 * 60 * 1000); // 1 hour before the call

    // 1. WAIT — sleep until just before the call so the brief is fresh at call time.
    if (runAt.getTime() > Date.now()) {
      await wait.until({ date: runAt });
    }

    // 2. STEPS — research the company (swap for a real web-search / enrichment call).
    const company = payload.email ? payload.email.split("@")[1] : "unknown company";
    const brief =
      `<h2>Pre-call brief — ${company}</h2>` +
      `<p><b>Snapshot:</b> …</p><p><b>Likely pain points:</b> …</p>` +
      `<p><b>3 questions to ask:</b> …</p>`;

    // 3. ACTION — email the rep before the call.
    if (payload.email) {
      await sendEmail("rep@yourteam.com", `Prep for your call — ${company}`, brief);
    }
    return { company, uid: payload.uid };
  },
});
