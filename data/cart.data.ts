// Real CartItem — replaces old mock. Type lives here, data lives in store/cart.store.ts.
export type { CartItem, AppliedPromo } from "./storefront.data";

export const PAYMENT_METHODS = [
  { id: "paystack" as const, label: "Paystack" },
  // { id: "flutterwave" as const, label: "Flutterwave" },
];

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];
