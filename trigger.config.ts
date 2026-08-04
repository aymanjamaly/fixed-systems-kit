import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "<your-trigger-project-ref>", // copy from the Trigger.dev dashboard
  dirs: ["./src/trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  maxDuration: 300,
});
