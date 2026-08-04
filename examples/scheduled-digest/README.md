# Example · Scheduled digest

**Shape:** Scheduled (pull). No receiver.

```
Clock (07:00 daily) → pull the numbers → compose the digest → post to Slack
```

The whole system is one file: `task.ts`. The `schedules.task` fires on the `cron`, the `run` does the work. There's nothing to catch — a scheduled system has no inbound request.

**Build it:** drop `task.ts` into `src/trigger/`, set `SLACK_WEBHOOK_URL`, run `npm run trigger:dev`, and use the Trigger.dev dashboard's **Test** to fire it once without waiting for 7am.

**Make it real:** replace `fakePull()` with a real fetch (your analytics API, a sheet, an RSS feed). That's the only part that changes.
