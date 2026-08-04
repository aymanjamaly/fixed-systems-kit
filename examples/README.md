# Examples — complete fixed systems

Three working reference builds, one per shape. Read the one closest to what you're building, then copy the pattern.

| Example | Shape | Teaches |
|---|---|---|
| [`scheduled-digest/`](scheduled-digest/) | Scheduled (pull) | a clock-triggered task that composes and sends — no receiver |
| [`telegram-capture/`](telegram-capture/) | Event (push) | the full receiver → task chain, with verify + idempotency |
| [`pre-call-research/`](pre-call-research/) | Event + wait | a task that sleeps until just before a call, then acts (`wait.until`) |

Each is the same chain — `source → trigger → engine → action` — with only the trigger and steps different.
