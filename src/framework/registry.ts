import type { Trigger } from "./triggers";

// Every defineSystem() call registers itself here. The webhook receiver looks a
// system up by id to know how to verify, normalise, and dedup its events.

export interface SystemEntry {
  id: string;
  trigger: Trigger;
  input?: { parse: (raw: unknown) => unknown };
}

const registry = new Map<string, SystemEntry>();

export function register(entry: SystemEntry): void {
  registry.set(entry.id, entry);
}

export function getSystem(id: string): SystemEntry | undefined {
  return registry.get(id);
}

export function listSystems(): SystemEntry[] {
  return [...registry.values()];
}
