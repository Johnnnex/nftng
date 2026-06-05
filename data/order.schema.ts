import { z } from "zod";

// ─── Orders — products admin actions ─────────────────────────────────────────

export const itemStatusUpdateSchema = z.object({
  status: z.enum(["packaged"]),
});
export type ItemStatusUpdateData = z.infer<typeof itemStatusUpdateSchema>;

export const itemLogisticsReadySchema = z.object({
  logisticsReady: z.literal(true),
});
export type ItemLogisticsReadyData = z.infer<typeof itemLogisticsReadySchema>;

export const itemRefundSchema = z.object({
  amount: z.number(),
  notes: z.string().optional(),
});
export type ItemRefundData = z.infer<typeof itemRefundSchema>;

export const orderRefundSchema = z.object({
  amount: z.number(),
  notes: z.string().optional(),
});
export type OrderRefundData = z.infer<typeof orderRefundSchema>;

// ─── Trips — logistics admin actions ─────────────────────────────────────────

export const createTripSchema = z.object({
  riderName: z.string().min(1),
  riderPhone: z.string().min(1),
  riderEmail: z.string().email().optional().or(z.literal("")),
  riderCompany: z.string().optional(),
  itemIds: z.array(z.string().uuid()).min(1),
});
export type CreateTripData = z.infer<typeof createTripSchema>;

export const patchTripSchema = z.object({
  riderName: z.string().min(1).optional(),
  riderPhone: z.string().min(1).optional(),
  riderEmail: z.string().email().optional().or(z.literal("")),
  riderCompany: z.string().optional(),
});
export type PatchTripData = z.infer<typeof patchTripSchema>;

// ─── Storefront — create order ────────────────────────────────────────────────

export const createOrderItemSchema = z.object({
  productId: z.string().uuid(),
  title: z.string(),
  image: z.string().nullable(),
  variantCombo: z.record(z.string(), z.string()),
  price: z.number().positive(),
  qty: z.number().int().min(1),
});

export const createOrderSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone number"),
    streetAddress: z.string().min(5, "Street address is required"),
    countryId: z.string().uuid("Select a country"),
    countryCode: z.string(),
    // transform "" → undefined so international orders (no state/city) pass uuid validation
    stateId: z.string().transform((v) => v || undefined).pipe(z.string().uuid().optional()),
    cityId: z.string().transform((v) => v || undefined).pipe(z.string().uuid().optional()),
    deliveryMethod: z.enum(["park", "gig", "direct"] as const).optional(),
    paymentMethod: z.enum(["paystack", "flutterwave"] as const).optional(),
    promoCode: z.string().optional(),
    items: z.array(createOrderItemSchema).min(1, "Cart is empty"),
  })
  .superRefine((d, ctx) => {
    if (d.countryCode === "NG") {
      if (!d.stateId) ctx.addIssue({ code: "custom", message: "Select a state", path: ["stateId"] });
      if (!d.cityId) ctx.addIssue({ code: "custom", message: "Select a city", path: ["cityId"] });
      if (!d.deliveryMethod) ctx.addIssue({ code: "custom", message: "Select a delivery method", path: ["deliveryMethod"] });
      if (!d.paymentMethod) ctx.addIssue({ code: "custom", message: "Select a payment method", path: ["paymentMethod"] });
    }
  });

export type CreateOrderData = z.infer<typeof createOrderSchema>;

// ─── International orders ─────────────────────────────────────────────────────

const outsideOrderItemSchema = z.object({
  productId: z.string().uuid(),
  productTitle: z.string(),
  variantCombo: z.record(z.string(), z.string()),
  qty: z.number().int().min(1),
  unitPrice: z.number().positive(),
  productImage: z.string().nullable().optional(),
});

export const outsideOrderSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  streetAddress: z.string().min(3),
  countryId: z.string().uuid(),
  items: z.array(outsideOrderItemSchema).min(1),
});
export type OutsideOrderData = z.infer<typeof outsideOrderSchema>;

export const resolveInternationalSchema = z.object({});
export type ResolveInternationalData = z.infer<typeof resolveInternationalSchema>;

// ─── Delivery geo config ──────────────────────────────────────────────────────

export const deliveryCountrySchema = z.object({
  name: z.string().min(1),
  code: z.string().length(2).toUpperCase(),
});
export type DeliveryCountryData = z.infer<typeof deliveryCountrySchema>;

export const deliveryStateSchema = z.object({
  countryId: z.string().uuid(),
  name: z.string().min(1),
});
export type DeliveryStateData = z.infer<typeof deliveryStateSchema>;

export const deliveryCitySchema = z.object({
  stateId: z.string().uuid(),
  name: z.string().min(1),
});
export type DeliveryCityData = z.infer<typeof deliveryCitySchema>;

export const deliveryConfigSchema = z.object({
  cityId: z.string().uuid(),
  method: z.enum(["park", "gig", "direct"]),
  price: z.number().nonnegative(),
  estimatedDays: z.string().optional(),
});
export type DeliveryConfigData = z.infer<typeof deliveryConfigSchema>;

export const deliveryConfigImportRowSchema = z.object({
  city_name: z.string().min(1),
  state_name: z.string().min(1),
  method: z.enum(["park", "gig", "direct"]),
  price: z.coerce.number().nonnegative(),
  estimated_days: z.string().optional(),
});
