# src/trigger — your tasks live here

This folder is registered in `trigger.config.ts` (`dirs: ["./src/trigger"]`), so **every `.ts` file here deploys as a real Trigger.dev task.** That's why it starts empty.

Build a task by copying a template from [`../../templates/`](../../templates/):

- `scheduled.template.ts` → a scheduled (cron/pull) system
- `task.template.ts` → an event system's engine

Templates deliberately live **outside** this folder so they can't register as phantom tasks. Copy one in, rename it, fill the steps.
