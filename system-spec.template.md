# System spec — <name your system>

> Copy this file, fill every field, then tell Claude Code: **"build the system in my spec."**
> Design on paper first. If you can't fill a field, you haven't finished designing.

---

## 1. Outcome (one line)
_What does "done" look like in the real world?_

> e.g. "When a lead books a call, the rep gets a research brief on their company an hour before it starts."

## 2. Trigger type — run the determinism gate first
- Does the right action change based on something the system must **judge**? **No** → fixed (build it). **Yes** → stop, it's agentic.
- Then: **scheduled** or **event-triggered**?

> Type: `scheduled` | `event-triggered`
> Why (the cue word): _"every…" → scheduled · "the moment…" → event_

## 3. Source
_Where the signal comes from, and what handles it._

> e.g. "A Cal.com booking (webhook)" · "The FB Ad Library (scrape on a schedule)" · "A Telegram bot message"

## 4. The steps (the engine), in order
_What has to happen, step by step, from trigger to outcome._

1.
2.
3.

## 5. Action(s)
_What lands in the real world. Which helper from `src/lib/actions.ts`?_

> e.g. "Email the rep the brief" → `sendEmail` · "Post to Slack" → `notifySlack`

## 6. Verify (event systems only)
_How does the receiver prove the request is really from the source?_

> e.g. "Cal.com signature" · "Telegram secret token" · "generic HMAC"

## 7. Idempotency key
_The stable ID that makes a repeated event run once._

> e.g. `order-<order.id>` · `booking-<booking.uid>` · `msg-<update.message_id>`

## 8. Test — how you'll prove it fired
- [ ] Fire it on purpose → the outcome lands, unattended.
- [ ] Forged request (event) → receiver returns `401`.
- [ ] Same event twice → **one** action.
- [ ] The run shows in the Trigger.dev dashboard.

---

*Fixed system: you designed the steps; the system runs them.*
