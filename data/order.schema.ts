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
  amount: z.number().positive(),
  notes: z.string().optional(),
});
export type ItemRefundData = z.infer<typeof itemRefundSchema>;

export const orderRefundSchema = z.object({
  amount: z.number().positive(),
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

// ─── International orders ─────────────────────────────────────────────────────

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
