import { handleWebhook } from "@/src/framework/receiver";
import "@/systems"; // side-effect import: registers every defined system

// One route for every event system. The [system] path segment selects which one,
// e.g. POST /api/webhooks/order-alert. The framework does verify → dedup → trigger.
export async function POST(req: Request, { params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  return handleWebhook(system, req);
}
