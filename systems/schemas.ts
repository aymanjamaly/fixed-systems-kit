import { z } from "zod";

// Validate + type the payloads your systems receive. `.passthrough()` keeps unknown
// fields so you don't have to model an entire Shopify order to use three of its fields.

export const OrderSchema = z
  .object({
    id: z.number(),
    order_number: z.number().optional(),
    total_price: z.string().optional(),
    currency: z.string().optional(),
    email: z.string().optional(),
    customer: z
      .object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    line_items: z.array(z.object({ title: z.string().optional(), quantity: z.number().optional() })).optional(),
  })
  .passthrough();

export const TelegramUpdate = z
  .object({
    update_id: z.number(),
    message: z
      .object({
        text: z.string().optional(),
        chat: z.object({ id: z.number() }),
      })
      .optional(),
  })
  .passthrough();
