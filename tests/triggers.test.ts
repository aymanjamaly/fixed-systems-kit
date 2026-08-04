import { describe, it, expect } from "vitest";
import { shopify, telegram, cal, webhook } from "../src/framework/triggers";

describe("triggers extract the stable idempotency id", () => {
  it("shopify → order id", () => {
    expect(shopify({ topic: "orders/create" }).extractId({ id: 42 })).toBe(42);
  });
  it("telegram → update_id", () => {
    expect(telegram().extractId({ update_id: 7 })).toBe(7);
  });
  it("cal → booking uid (un-nested from payload)", () => {
    expect(cal().extractId({ payload: { uid: "abc" } })).toBe("abc");
    expect(cal().parse!({ payload: { uid: "abc" } })).toEqual({ uid: "abc" });
  });
  it("webhook → configurable id field", () => {
    expect(webhook({ idField: "eventId" }).extractId({ eventId: "x" })).toBe("x");
    expect(webhook().extractId({ id: "y" })).toBe("y");
  });
});
