import { z } from "zod";

export const orderIdSchema = z
  .string()
  .min(1, "Please enter an order ID")
  .regex(/^ORD-\d+$/, "Order ID format should be ORD-XXXX (e.g. ORD-2609)");
