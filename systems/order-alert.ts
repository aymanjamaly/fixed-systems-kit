import { defineSystem, shopify } from "@/src/framework";
import { OrderSchema } from "./schemas";

// EVENT · Shopify order → alert the team, louder for orders that need a human eye.
// The receiver, HMAC verification, and idempotency are all handled by the framework.
export const orderAlert = defineSystem({
  id: "order-alert",
  trigger: shopify({ topic: "orders/create" }),
  input: OrderSchema,
  run: async (order, { actions }) => {
    const total = Number(order.total_price ?? 0);
    const who =
      [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") ||
      order.customer?.email ||
      order.email ||
      "a customer";

    const line = `Order #${order.order_number ?? order.id} — ${total} ${order.currency ?? ""} · ${who}`;
    const big = total >= 500;

    await actions.slack(big ? `⚠️ *Large order* — ${line}` : `🛒 ${line}`);
    return { orderId: order.id, total, big };
  },
});
