// Barrel — importing this registers every system (populates the framework registry).
// The webhook route imports it so the receiver can find each event system by id.
export * from "./order-alert";
export * from "./hn-digest";
export * from "./telegram-save";
