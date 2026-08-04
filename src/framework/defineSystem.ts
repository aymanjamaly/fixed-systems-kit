import { task, schedules } from "@trigger.dev/sdk";
import type { z } from "zod";
import { register } from "./registry";
import type { EventTrigger, ScheduleTrigger } from "./triggers";
import { actions, type Actions } from "./actions";

export interface Ctx {
  actions: Actions;
}

/** An event system: a webhook source + a validated input + your steps. */
export interface EventSystem<S extends z.ZodTypeAny> {
  id: string;
  trigger: EventTrigger;
  input: S;
  run: (input: z.infer<S>, ctx: Ctx) => unknown | Promise<unknown>;
}

/** A scheduled system: a cron + your steps (no external payload to validate). */
export interface ScheduleSystem {
  id: string;
  trigger: ScheduleTrigger;
  run: (payload: { timestamp: Date }, ctx: Ctx) => unknown | Promise<unknown>;
}

// One declaration → a fully-wired system. Returns the Trigger.dev task so exporting
// it (`export const x = defineSystem(...)`) lets the CLI discover it under `dirs`.
export function defineSystem<S extends z.ZodTypeAny>(config: EventSystem<S>): ReturnType<typeof task>;
export function defineSystem(config: ScheduleSystem): ReturnType<typeof schedules.task>;
export function defineSystem(config: any): any {
  if (config.trigger.kind === "schedule") {
    const sys = config as ScheduleSystem;
    register({ id: sys.id, trigger: sys.trigger });
    return schedules.task({
      id: sys.id,
      cron: sys.trigger.cron,
      run: async (payload: any) => sys.run(payload, { actions }),
    });
  }

  const sys = config as EventSystem<z.ZodTypeAny>;
  register({ id: sys.id, trigger: sys.trigger, input: sys.input });
  return task({
    id: sys.id,
    run: async (raw: unknown) => sys.run(sys.input.parse(raw), { actions }),
  });
}
